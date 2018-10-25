import { WorkItemTemplateReference } from "TFS/WorkItemTracking/Contracts";
import _WorkItemClient = require("TFS/WorkItemTracking/RestClient");
import _WorkItemService = require("TFS/WorkItemTracking/Services");
import { Node } from "./node";
import { Task } from "./task";
import { TaskTree } from "./task-tree";

let taskTreeMap: Map<string, TaskTree>;

export function InitializeWorkItemGroup(): void {
    const context = VSS.getWebContext();
    console.log(context);

    // Load templates
    LoadTaskSuite(context);

    // Load widget to user
    ShowGroupOnPage(context);

    // Wire up dropdown onChange event handler
    $("#available-root-templates").change((evt) => {
        const selectedTaskId = $("#available-root-templates").val() as string;
        const targetTreeNode = taskTreeMap.get(selectedTaskId).RootNode;
        AddTasksToContainer(targetTreeNode);
    });

    // Wire up button onClick even handler
    $("#create-tasks-btn").click((evt) => {
        const workItemClient = _WorkItemClient.getClient();
        // tslint:disable-next-line:max-line-length
        // TODO: See an example here: https://github.com/figueiredorui/1-click-child-links/blob/master/src/scripts/app.js
    });
}

function LoadTaskSuite(context: WebContext): void {
    const workItemClient = _WorkItemClient.getClient();
    workItemClient.getTemplates(context.project.id, context.team.id, "Task").then((templates) => {
        const tasks: Task[] = [];
        for (const template of templates) {
            const task = new Task(template.id, template.name, context.project.id);
            tasks.push(task);
        }

        taskTreeMap = new Map();
        const rootTasks = tasks.filter((task) => {
            return task.IsRootTask;
        });

        for (const rootTask of rootTasks) {
            const subTasks = tasks.filter((task) => task.Path.startsWith(rootTask.Path) || task.Id === rootTask.Id);

            // Build task suite for this task
            taskTreeMap.set(rootTask.Id, new TaskTree(subTasks));

            // Add root task to <select> element
            $("#available-root-templates").append(new Option(rootTask.Name, rootTask.Id));
        }
        if (taskTreeMap.size > 0) {
            const selectedTaskId = $("#available-root-templates").val() as string;

            // Show first set of tasks on page
            AddTasksToContainer(taskTreeMap.get(selectedTaskId).RootNode);
        } else {
            $("#sub-task-container").append("<div>No task templates setup for this team</div>");
        }

        console.log(taskTreeMap);
    });
}

function ShowGroupOnPage(context: WebContext): void {
    const workItemService = _WorkItemService.WorkItemFormService.getService(context);
    workItemService.then((workItem) => {
        console.log(workItem);
        workItem.getFieldValue("Work Item Type").then((type) => {
            if (type !== "User Story") {
                VSS.resize(0, 0); // TODO Figure out how to unregister the extension
            }

            VSS.notifyLoadSucceeded();
        });
    });
}

function AddTasksToContainer(rootNode: Node): void {
    $("#sub-task-container").empty();

    const newListElement = $("<ul></ul>");
    $("#sub-task-container").append(newListElement);
    for (const childNode of rootNode.Children) {
        AddTaskToContainer(childNode, newListElement);
    }
}

function AddTaskToContainer(node: Node, parentElement: JQuery<HTMLElement>): void {
    $(parentElement).append(`<li>${node.Task.Name}</li>`);

    if (!node.IsLeafNode) {
        const newListElement = $("<ul></ul>");
        $(parentElement).append(newListElement);
        for (const childNode of node.Children) {
            AddTaskToContainer(childNode, newListElement);
        }
    }
}
