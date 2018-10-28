import { WorkItem, WorkItemTemplate } from "TFS/WorkItemTracking/Contracts";
import _WorkItemClient = require("TFS/WorkItemTracking/RestClient");
import _WorkItemService = require("TFS/WorkItemTracking/Services");
import { Control } from "VSS/Controls";
import StatusIndicator = require("VSS/Controls/StatusIndicator");
import { JsonPatchDocument } from "VSS/WebApi/Contracts";
import { Node } from "./node";
import { Task } from "./task";
import { TaskTree } from "./task-tree";

// Global variables oh my!
const TaskTreeMap: Map<string, TaskTree> = new Map();
let CurrentWorkItem: WorkItem;

// There is a more elegant solution to determine when tasks have been
// created if you are familiar with promises... I am not
let WorkItemsToUpdateCount: number = 0;
let WorkItemsUpdatedCount: number  = 0;
let CreatedTaskIds: number[];
let WaitControl: StatusIndicator.WaitControl;

export function InitializeWorkItemGroup(): void {
    const context = VSS.getWebContext();

    // Load current work item
    GetCurrentWorkItem(context);

    // Load templates
    GetTaskTemplates(context);

    // Wire up dropdown onChange event handler
    $("#available-root-templates").change((evt) => {
        const selectedTaskId = $("#available-root-templates").val() as string;
        const targetTreeNode = TaskTreeMap.get(selectedTaskId).RootNode;

        AddRootTaskToView(targetTreeNode);
    });

    // Wire up button onClick even handler
    $("#create-tasks-btn").click((evt) => {
        const selectedTaskId = $("#available-root-templates").val() as string;
        const targetTree = TaskTreeMap.get(selectedTaskId);

        // Refresh these counts -- used later to know when to refresh the story
        WorkItemsUpdatedCount = 0;
        WorkItemsToUpdateCount = targetTree.TotalNodeCount;
        CreatedTaskIds = [];
        $("#create-tasks-btn").prop("disabled", true);
        WaitControl.startWait();

        CreateTaskFromNode(CurrentWorkItem, targetTree.RootNode, context);
    });
}

function AddRootTaskToView(rootNode: Node): void {
    // Empty container
    $("#sub-task-container").empty();

    // Create top level list element
    const newListElement = $("<ul></ul>");
    $("#sub-task-container").append(newListElement);

    // Add each child to list element (will use recursion)
    for (const childNode of rootNode.Children) {
        AddTasksToView(childNode, newListElement);
    }

    // Resize container
    const contentContainer = $("#content");
    VSS.resize(contentContainer.width(), contentContainer.height());
}

function AddTasksToView(node: Node, parentElement: JQuery<HTMLElement>): void {
    // Add task name to parent element
    $(parentElement).append(`<li>${node.Task.Name}</li>`);

    // Recurse on any children
    if (!node.IsLeafNode) {
        const newListElement = $("<ul></ul>");
        $(parentElement).append(newListElement);
        for (const childNode of node.Children) {
            AddTasksToView(childNode, newListElement);
        }
    }
}

function CreateTaskFromNode(parentWorkItem: any, node: Node, context: WebContext): void {
    const workItemClient = _WorkItemClient.getClient();
    workItemClient.getTemplate(context.project.id, context.team.id, node.Task.Id)
    .then((template) => {
        const newWorkItem = GetNewWorkItem(parentWorkItem, template, node.Task.Name);
        return workItemClient.createWorkItem(newWorkItem, context.project.id, "Task");
    })
    .then((workItem) => {
        CreatedTaskIds.push(workItem.id);
        const relationPatch: JsonPatchDocument = [{
            op: "add",
            path: "/relations/-",
            value: {
                attributes: {
                    isLocked: false,
                },
                rel: "System.LinkTypes.Hierarchy-Forward",
                url: workItem.url,
            },
        }];

        // TODO Transpiler is not letting me chain this promise onto the previous one
        workItemClient.updateWorkItem(relationPatch, parentWorkItem.id).then(() => {
            // Create child nodes
            if (!node.IsLeafNode) {
                for (const child of node.Children) {
                    CreateTaskFromNode(workItem, child, context);
                }
            }

            HandleWorkItemCreationSuccess(workItem.id);
        }, (error) => {
            HandleWorkItemCreationError(error);
        });
    }, (error) => {
        HandleWorkItemCreationError(error);
    });
}

function GetCurrentWorkItem(context: WebContext): void {
    console.log("Loading work item form service...");

    _WorkItemService.WorkItemFormService.getService().then((service) => {
        service.isNew().then((isNew) => {
            if (isNew) {
                $("#task-only-message").show();
                $("#task-templates-container").hide();
                VSS.notifyLoadSucceeded();
            } else {
                service.getId().then((workItemId) => {
                    console.log(workItemId);
                    console.log("Loading work item...");

                    const workItemClient = _WorkItemClient.getClient();

                    // TODO Transpiler is not letting me chain this promise onto the previous one
                    workItemClient.getWorkItem(workItemId).then((workItem) => {
                        CurrentWorkItem = workItem;
                        console.log(CurrentWorkItem);

                        // Only show this extension for user stories
                        const workItemType = workItem.fields["System.WorkItemType"];
                        if (workItemType !== "User Story") {
                            $("#task-only-message").show();
                            $("#task-templates-container").hide();
                        }

                        VSS.notifyLoadSucceeded();
                    }, (error) => {
                        console.log(error);
                        $("#content").hide();
                        VSS.notifyLoadFailed(error);
                    });
                }, (error) => {
                    console.log(error);
                    $("#content").hide();
                    VSS.notifyLoadFailed(error);
                });
            }
        });
    });
}

function GetNewWorkItem(workItem: WorkItem, template: WorkItemTemplate, defaultTitle: string): JsonPatchDocument {
    const newWorkItem = [];

    // tslint:disable-next-line:forin
    for (const fieldKey in template.fields) {
        const templateFieldValue = template.fields[fieldKey];
        const parentFieldValue = workItem.fields[fieldKey];

        if (templateFieldValue && templateFieldValue !== "") {
            newWorkItem.push({
                op: "add",
                path: `/fields/${fieldKey}`,
                value: templateFieldValue,
            });
        } else if (parentFieldValue && parentFieldValue !== "") {
            newWorkItem.push({
                op: "add",
                path: `/fields/${fieldKey}`,
                value: parentFieldValue,
            });
        }
    }

    // If the template has no title, use the name
    if (!template.fields["System.Title"] || template.fields["System.Title"] === "") {
        newWorkItem.push({
            op: "add",
            path: "/fields/System.Title",
            value: defaultTitle,
        });
    }

    // Copy AreaPath from parent
    if (workItem.fields["System.AreaPath"] && workItem.fields["System.AreaPath"] !== "") {
        newWorkItem.push({
            op: "add",
            path: "/fields/System.AreaPath",
            value: workItem.fields["System.AreaPath"],
        });
    }

    // Copy IterationPath from parent
    if (workItem.fields["System.IterationPath"] && workItem.fields["System.IterationPath"] !== "") {
        newWorkItem.push({
            op: "add",
            path: "/fields/System.IterationPath",
            value: workItem.fields["System.IterationPath"],
        });
    }

    return newWorkItem;
}

function GetTaskTemplates(context: WebContext): void {
    console.log("Loading task templates...");

    const workItemClient = _WorkItemClient.getClient();
    workItemClient.getTemplates(context.project.id, context.team.id, "Task")
        .then((templates) => {
            console.log(templates);

            const tasks: Task[] = [];
            for (const template of templates) {
                const task = new Task(template.id, template.name, context.project.id);
                tasks.push(task);
            }

            const rootTasks = tasks.filter((task) => {
                return task.IsRootTask;
            });

            for (const rootTask of rootTasks) {
                // Get all tasks that match the root tasks name - see README for task naming structure
                const subTasks = tasks.filter((task) => task.Path.startsWith(rootTask.Path) || task.Id === rootTask.Id);

                // Build task suite for this task
                TaskTreeMap.set(rootTask.Id, new TaskTree(subTasks));

                // Add root task to <select> element
                $("#available-root-templates").append(new Option(rootTask.Name, rootTask.Id));
            }

            if (TaskTreeMap.size > 0) {
                // Make wait control available
                const waitControlOptions: StatusIndicator.IWaitControlOptions = {
                    message: "Creating tasks...",
                };

                WaitControl = Control.create(StatusIndicator.WaitControl,
                    $("#content"), waitControlOptions);

                const selectedTaskId = $("#available-root-templates").val() as string;

                // Show first set of tasks on page
                AddRootTaskToView(TaskTreeMap.get(selectedTaskId).RootNode);
            } else {
                $("#sub-task-container").append("<div>No task templates setup for this team</div>");
            }
        });
}

function HandleWorkItemCreationError(error: any): void {
    RevertTaskCreation();
    WaitControl.endWait();
    $("#widget-errors").text(`Failed to create task templates due to ${error.message}. Rolling back all changes.`);
}

function HandleWorkItemCreationSuccess(taskId: number): void {
    CreatedTaskIds.push(taskId);
    WorkItemsUpdatedCount = WorkItemsUpdatedCount + 1;
    WaitControl.setMessage(`Created ${WorkItemsUpdatedCount} of ${WorkItemsToUpdateCount} tasks`);

    if (WorkItemsUpdatedCount === WorkItemsToUpdateCount) {
        WaitControl.endWait();
        $("#create-tasks-btn").prop("disabled", false);
        VSS.getService(VSS.ServiceIds.Navigation)
            .then((navigationService) => {
                // Need to cast it to any to prevent transpiler from complaining
                const navigationServic = navigationService as any;
                navigationServic.reload();
            });
    }
}

function RevertTaskCreation(): void {
    for (const taskId of CreatedTaskIds) {
        const workItemClient = _WorkItemClient.getClient();
        workItemClient.deleteWorkItem(taskId);
    }
}
