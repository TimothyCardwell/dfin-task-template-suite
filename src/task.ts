export class Task {
    public Id: string;
    public Name: string;
    public Path: string;
    public Project: string;
    public IsRootTask: boolean;

    constructor(id: string, name: string, project: string) {
        // Don't allow null or empty ids
        if (!id || id === "") {
            throw new Error("Cannot create task without an id");
        }

        // Don't allow null or empty names
        if (!name || name === "") {
            throw new Error("Cannot create task without a name");
        }

        // Don't allow null or empty projects
        if (!project || project === "") {
            throw new Error("Cannot create task without a project");
        }

        this.Id = id;
        this.Project = project;

        // tt_ is a magic string to let this extension know which templates are considered root templates
        if (name.startsWith("tt_")) {
            this.Name = name.slice(3);
            this.Path = this.Name;
            this.IsRootTask = true;
        } else {
            this.Path = name;

            // API:Contract:Manager is the path, Manager is the name
            this.Name = name.substring(name.lastIndexOf(":") + 1);
            this.IsRootTask = false;
        }
    }
}
