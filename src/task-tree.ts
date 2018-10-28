import { Node } from "./node";
import { Task } from "./task";

export class TaskTree {
    public RootNode: Node;
    public TotalNodeCount: number;

    constructor(tasks: Task[]) {
        if (!tasks) {
            throw new Error("Cannot build tree from an empty task list");
        }

        // Specifically used for testing purposes, this can be removed if needed
        if (tasks.length === 0) {
            return;
        }

        tasks = this.RemoveNonTaskSuiteTemplates(tasks);
        tasks = this.SortByColonCountAscending(tasks);
        this.BuildTree(tasks);
    }

    public RemoveNonTaskSuiteTemplates(tasks: Task[]): Task[] {
        return tasks.filter((task) => task.Path.includes(":") || task.IsRootTask);
    }

    public SortByColonCountAscending(tasks: Task[]): Task[] {
        return tasks.sort((task1, task2) => {
            const task1Colons = (task1.Path.match(/:/g) || []).length;
            const task2Colons = (task2.Path.match(/:/g) || []).length;

            if (task1Colons > task2Colons) {
                return 1;
            } else if (task2Colons > task1Colons) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    public BuildTree(tasks: Task[]): void {
        if (!tasks[0].IsRootTask) {
            throw new Error(`Ensure the task list is sorted correctly, and that the tasks were
                created correctly. Cannot create tree because root node was not found`);
        }

        this.RootNode = new Node(tasks[0]);
        for (let i = 1; i < tasks.length; i++) {
            const task = tasks[i];
            if (task.IsRootTask) {
                throw new Error(`Duplicate root tasks found - ensure the task templates are setup correctly`);
            }

            this.AddTask(this.RootNode, task, 0);
        }

        this.TotalNodeCount = tasks.length;
    }

    private AddTask(currentNode: Node, task: Task, currentLevel: number): void {
        const colonCount = task.Path.match(/:/g).length;

        // Base case: we are at the right level, add the child node
        if (currentLevel === colonCount - 1 && task.Path.startsWith(currentNode.Task.Path)) {
            currentNode.AddChildNode(new Node(task));
            return;
        }

        const nextNode = currentNode.Children.find((child) => {
            return task.Path.startsWith(child.Task.Path);
        });

        // Ignore any tasks that aren't part of this tree
        if (!nextNode) {
            return;
        }

        const nextLevel = currentLevel + 1;
        this.AddTask(nextNode, task, nextLevel);
    }
}
