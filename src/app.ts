import _WorkClient = require("TFS/Work/RestClient");
import _WorkItemClient = require("TFS/WorkItemTracking/RestClient");
import _WorkItemService = require("TFS/WorkItemTracking/Services");

export function Log(): void {
  console.log("Hooked up correctly!")

  var context = VSS.getWebContext();
  console.log(context);

  GetWorkItemService(context)
    .then(result => {
      console.log(result);
    });

  const workClient = GetWorkClient();
  //workClient.getBoard()
  //workClient.getTeamSettings(context.team.id)  

  const workItemClient = GetWorkItemClient();

  console.log("Getting relation types...")
  workItemClient.getRelationTypes()
    .then(result => {
      console.log("Successfully got relation types");
      console.log(result);
    });

  console.log("Getting root nodes...")
  workItemClient.getRootNodes(context.project.id)
    .then(result => {
      console.log("Successfully got root nodes");
      console.log(result);
    });

  console.log("Getting templates...")
  workItemClient.getTemplates(context.project.id, context.team.id)
    .then(result => {
      console.log("Successfully got templates");
      console.log(result);

      const taskSuiteTemplates = result.filter(x => x.workItemTypeName == "Task");
    });

  /*
  console.log("Getting work items...")
  workItemClient.getWorkItems()
    .then(result => {
      console.log("Successfully got root nodes");
      console.log(result);
      for (const workItemClassificationNode in result) {
        console.log(workItemClassificationNode);
      }
    });
  */

  console.log("Getting work item type categories...")
  workItemClient.getWorkItemTypeCategories(context.project.id)
    .then(result => {
      console.log("Successfully work item type categories");
      console.log(result);
    });

  console.log("Getting work item types...")
  workItemClient.getWorkItemTypes(context.project.id)
    .then(result => {
      console.log("Successfully got work item types");
      console.log(result);
      result.forEach(workItemType => {
        if (workItemType.name != 'User Story') {
          // TODO Don't show this group!
        } else {
          // TODO Show this group!
        }
      });
    });
}

export function Initialize(): void {
  // Get all root level (by tag?) task templates
  // Display them on the page
  // UpdateSelectedTemplate()
  throw Error("Not Implemented");
}

export function Execute(taskId: any): void {
  // For the task id, get all sub tasks
  // For the current work item, get all child work items
  // Add the main task to the current work item, if it doesn't already exist
  // Add each sub task to the main task, if it doesn't already exist
  throw Error("Not Implemented");
}

export function OnChange(evt: any): void {
  // Call other method
  throw Error("Not Implemented");
}

function GetWorkClient(): _WorkClient.WorkHttpClient4_1 {
  return _WorkClient.getClient();
}

function GetWorkItemService(context: WebContext): IPromise<_WorkItemService.IWorkItemFormService> {
  return _WorkItemService.WorkItemFormService.getService(context);
}

function GetWorkItemClient(): _WorkItemClient.WorkItemTrackingHttpClient4_1 {
  return _WorkItemClient.getClient()
}

function UpdateSelectedTemplate(): void {
  // Update UI
  throw Error("Not Implemented");
}

function GetWorkItemChildren(workItem: any): any[] {
  // Get work item children
  return [];
}

function GetWorkItemTemplates(tag: any): void {
  // How to retrieve tag?
  throw Error("Not Implemented");
}

function CreateWorkItem(workItem: any): void {
  // Can we batch save?
  throw Error("Not Implemented");
}