export function Log(): void {
  console.log("Hooked up correctly!")
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