import _WorkItemClient = require("TFS/WorkItemTracking/RestClient");
import _WorkItemService = require("TFS/WorkItemTracking/Services");
import { WorkItemTemplateReference } from "TFS/WorkItemTracking/Contracts";

let availableTemplates: WorkItemTemplateReference[];

export function InitializeWorkItemGroup(): void {
  const context = VSS.getWebContext();
  availableTemplates = [];

  // Load templates
  const workItemClient = GetWorkItemClient();
  workItemClient.getTemplates(context.project.id, context.team.id, "Task")
    .then(result => {
      var rootTemplates = result.filter(x => x.name.startsWith('tt_'));
      for(let rootTemplate of rootTemplates) {
        const name = rootTemplate.name.slice(3);

        availableTemplates.push(rootTemplate);

        const relatedTemplates = result.filter(t => t.name.startsWith(name));
        console.log(relatedTemplates);
        availableTemplates.push(...relatedTemplates);

        $('#available-root-templates').append(`<option value="${rootTemplate.id}">${name}</option>`);
      }
    });

  $('#available-root-templates').change(evt => {
    $('#sub-task-container').empty();

    const rootTemplate = availableTemplates.find(t => t.id == evt.target['value']);
    const name = rootTemplate.name.slice(3);

    const childTemplates = availableTemplates.filter(t => t.name.startsWith(name)).sort();
    childTemplates.forEach(t => {
      $('#sub-task-container').append(`<div>${t.name}</div>`)
    });
  });

  GetWorkItemService(context).then(workItemService => {
    workItemService.getFieldValue('Work Item Type').then(type => {
      console.log(type);

      if (type != "User Story") {

      }
      
      VSS.notifyLoadSucceeded();
    });
  });
}

function GetWorkItemService(context: WebContext): IPromise<_WorkItemService.IWorkItemFormService> {
  return _WorkItemService.WorkItemFormService.getService(context);
}

function GetWorkItemClient(): _WorkItemClient.WorkItemTrackingHttpClient4_1 {
  return _WorkItemClient.getClient()
}