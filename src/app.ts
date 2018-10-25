import { WorkItemTemplateReference } from "TFS/WorkItemTracking/Contracts";
import _WorkItemClient = require("TFS/WorkItemTracking/RestClient");
import _WorkItemService = require("TFS/WorkItemTracking/Services");
import { Node } from "./node";
import { Task } from "./task";
import { TaskTree } from "./task-tree";

let taskTree: TaskTree;

export function InitializeWorkItemGroup(): void {
    const context = VSS.getWebContext();

    // Load templates
    LoadTaskSuite(context);

    // Load widget to user
    ShowGroupOnPage(context);

    // Wire up dropdown onChange event handler
    $("#available-root-templates").change((evt) => {
        const targetTreeNode = taskTree.RootNode.Children.find((child) => {
            console.log(evt.target.nodeValue);
            // tslint:disable-next-line:no-string-literal
            return child.Task.Id === evt.target["value"];
        });

        AddTasksToContainer(targetTreeNode);
    });

    // Wire up button onClick even handler
    $("#create-tasks-btn").click((evt) => {
        const workItemClient = _WorkItemClient.getClient();
        // TODO: See an example here: https://github.com/figueiredorui/1-click-child-links/blob/master/src/scripts/app.js
    });
}

function LoadTaskSuite(context: WebContext): void {
    const workItemClient = _WorkItemClient.getClient();

    console.log(context);

    workItemClient.getTemplates(context.project.id, context.team.id, "Task").then((templates) => {
        const tasks: Task[] = [];
        for (const template of templates) {
            const task = new Task(template.id, template.name, context.project.id);
            tasks.push(task);
        }

        taskTree = new TaskTree(tasks);
        if (!taskTree.RootNode.IsLeafNode) {
            for (const rootTask of taskTree.RootNode.Children) {
                $("#available-root-templates").append(new Option(rootTask.Task.Name, rootTask.Task.Id));
            }

            // Show first set of tasks on page
            AddTasksToContainer(taskTree.RootNode.Children[0]);
        } else {
            $("#sub-task-container").append("<div>No task templates setup for this team</div>");
        }

        console.log(taskTree);
    });
}

function ShowGroupOnPage(context: WebContext): void {
    const workItemService = _WorkItemService.WorkItemFormService.getService(context);
    workItemService.then((workItem) => {
        console.log(workItem);
        workItem.getFieldValue("Work Item Type").then((type) => {
            if (type !== "User Story") {
                VSS.resize(0, 0);
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
