import { Task } from "./task";

export class Node {
    public Task: Task;
    public Children: Node[];
    public IsLeafNode: boolean;

    constructor(task: Task) {
        if (task == null) {
            throw new Error("Cannot create a node with a null task");
        } else {
            this.Task = task;
            this.Children = [];
            this.IsLeafNode = true;
        }
    }

    public AddChildNode(node: Node): void {
        if (node == null) {
            throw new Error("Cannot create a child node with a null task");
        } else {

            // Make sure we aren't adding the same child multiple times
            const duplicateChild = this.Children.find((child) => child.Task.Id === node.Task.Id);
            if (duplicateChild) {
                console.warn(`Attempting to add the same child multiple times: ${node.Task.Name}`);
                return;
            }

            this.Children.push(node);
            this.IsLeafNode = false;
        }
    }
}
