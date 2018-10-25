import { Node } from "./node";
import { Task } from "./task";

export class TaskTree {
    public RootNode: Node;
    private RootNodeId: string = "00000000-0000-0000-0000-000000000000";
    private RootNodePath: string = "NotARealTask";
    private RootNodeProject: string = "NotARealProject";

    constructor(tasks: Task[]) {
        if (!tasks) {
            throw new Error("Cannot build tree from an empty task list");
        }

        // Initialize root node
        const placeholderTask = new Task(this.RootNodeId, this.RootNodePath, this.RootNodeProject);
        this.RootNode = new Node(placeholderTask);

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
        for (const task of tasks) {
            if (task.IsRootTask) {
                this.RootNode.AddChildNode(new Node(task));
            } else {
                this.AddTask(this.RootNode, task, -1);
            }
        }
    }

    private AddTask(currentNode: Node, task: Task, currentLevel: number): void {
        const colonCount = task.Path.match(/:/g).length;

        // Base case: we are at the right level, add the child node
        if (currentLevel === colonCount - 1) {
            currentNode.AddChildNode(new Node(task));
            return;
        }

        const nextNode = currentNode.Children.find((child) => {
            return task.Path.startsWith(child.Task.Path);
        });

        // This is hit when task templates are setup incorrectly (i.e. fat fingered the path), warn instead of error
        // so that not everyone is affected
        if (!nextNode) {
            console.warn(`Cannot add task ${task.Path} to tree due to no matching parent.
                    Closest parent path is ${currentNode.Task.Path}`);
            return;
        }

        const nextLevel = currentLevel + 1;
        this.AddTask(nextNode, task, nextLevel);
    }
}
