Update styles according to this: https://docs.microsoft.com/en-us/azure/devops/extend/develop/styles-from-widget-sdk?view=vsts

# Setup Instructions

## Environment Setup
1. Clone this repo
2. Run `npm install`

## Available NPM Commands
Use `npm run build` to transpile your typescript
Use `npm run package` to create a deployable package
Use `npm run test` to test your code NOTE - As of today you need to change your tsconfig module to `commonjs` to run tests

# Deployment Instructions
1. Go to your publisher hub (i.e. https://marketplace.visualstudio.com/manage/publishers/TimCardwell)
2. Install or Update your extension
3. Share the extension with a target organization
4. Install the extension by going to the organization's marketplace and filtering by _Shared with me_

# Overview
This is an extension that allows your to build hierarichal task templates, and create many tasks relationships with a single click TODO reword this sentence

## Task Template Naming Guide
The extension works by retrieving all available task templates, organizing them into a tree, and then creating new tasks out of them from the root down. In
order to accomplish this, task templates need to be created following a specific convention. The root task name must always start with *tt_*, and child task
names must take the form of parentTaskName:childTaskName.

For example, imagine you want to template out all of the tasks for creating an API endpoint. The root task would need to be titled *tt_ApiEndpoint*. Building an 
endpoint requires three subtasks: Creating the route, creating the models, and creating the logic to process the request. Therefore, your three additional templates
would be: *ApiEndpoint:Route*, *ApiEndpoint:Models*, *ApiEndpoint:Logic*. Finally, you need to include unit testing and documentation subtasks for your logic task,
so you create the following two templates: *ApiEndpoint:Logic:UnitTests*, *ApiEndpoint:Logic:Documentation*.

Your final tree would look like:
ApiEndpoint
-- Route
-- Models
-- Logic
---- Unit Tests
---- Documentation

## Development
https://docs.microsoft.com/en-us/azure/devops/extend/overview

Make sure you are using a tool that correctly applied .editorconfig rules and lints your code

# Remaining Work Items
 - Truly understand module loading so that you can...
  - Figure out how to run Jasmine tests without modifying tsconfig
  - Figure out why console errors appear even through the extension is working correctly
  - Ensure you are writing code correctly
 - Add tests around app.ts
  - Possibly pull work item stuff into it's own service (requires understanding of modules above)
  - Figure out how to mock the VSS calls
  - Possibly add karma?
 - Implement npm run publish command to directly update