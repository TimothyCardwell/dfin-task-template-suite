import { Task } from "./task";
import { TaskTree } from "./task-tree";

// tslint:disable:max-line-length
describe("task-tree", () => {

    describe("can be constructed", () => {

        it("should be created successfully", () => {
            const taskList: Task[] = [];
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_SampleTaskOneName", "SampleProjectName"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.Task.Id).toEqual("00000000-0000-0000-0000-000000000001");
        });

        it("should throw for a null task list", () => {
            expect(() => new TaskTree(null)).toThrowError();
        });

        it("should allow empty task list", () => {
            // Empty list is allowed so that tasking helper methods is easier later
            // There is no real functionality that requires an empty task list to be supported
            const tree = new TaskTree([]);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeUndefined();
        });

        it("should keep track of total node count", () => {
            const taskList: Task[] = [];

            // Level 1
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProject"));

            // Level 2
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "TaskOne:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "TaskOne:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "TaskOne:SubTaskThree", "SampleProject"));

            const tree = new TaskTree(taskList);
            expect(tree.TotalNodeCount).toEqual(4);
        });
    });

    describe("can remove irrelevant task templates", () => {

        it("should only include tasks starting with tt_ or those with colons", () => {
            const taskList: Task[] = [];
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "BadTaskName", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_GoodTaskName", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "GoodTaskName:Path", "SampleProjectName"));

            const tree = new TaskTree([]);
            const tasks = tree.RemoveNonTaskSuiteTemplates(taskList);
            expect(tasks).toBeDefined();
            expect(tasks.length).toEqual(2);
        });

        it("should return an empty task list when presented with an empty task list", () => {
            const tree = new TaskTree([]);
            const tasks = tree.RemoveNonTaskSuiteTemplates([]);
            expect(tasks).toBeDefined();
            expect(tasks.length).toEqual(0);
        });
    });

    describe("can sort by colon count ascending", () => {

        it("should sort by colon count ascending", () => {
            const taskList: Task[] = [];
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "Root:Path:SubPath", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_Root", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "Root:Path:SubPath:SubSubPath", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "Root:Path:SubPath:SubSubPath:SubSubSubPath", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "Root:Path", "SampleProjectName"));

            const tree = new TaskTree([]);
            const tasks = tree.SortByColonCountAscending(taskList);
            expect(tasks).toBeDefined();
            expect(tasks.length).toEqual(5);
            expect(tasks[0].Id).toEqual("00000000-0000-0000-0000-000000000002");
            expect(tasks[1].Id).toEqual("00000000-0000-0000-0000-000000000003");
            expect(tasks[2].Id).toEqual("00000000-0000-0000-0000-000000000004");
            expect(tasks[3].Id).toEqual("00000000-0000-0000-0000-000000000005");
            expect(tasks[4].Id).toEqual("00000000-0000-0000-0000-000000000006");
        });

        it("should return an empty task list when presented with an empty task list", () => {
            const tree = new TaskTree([]);
            const tasks = tree.SortByColonCountAscending([]);
            expect(tasks).toBeDefined();
            expect(tasks.length).toEqual(0);
        });
    });

    describe("can build a tree", () => {

        it("should build a tree one level deep", () => {
            const taskList: Task[] = [];
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProjectName"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.IsLeafNode).toBeTruthy();
            expect(tree.RootNode.Children.length).toEqual(0);
        });

        it("should build a tree two levels deep", () => {
            const taskList: Task[] = [];

            // Level 1
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProject"));

            // Level 2
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "TaskOne:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "TaskOne:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "TaskOne:SubTaskThree", "SampleProject"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.IsLeafNode).toBeFalsy();
            expect(tree.RootNode.Children.length).toEqual(3);

            for (const task of tree.RootNode.Children) {
                expect(task).toBeDefined();
                expect(task.IsLeafNode).toBeTruthy();
                expect(task.Children).toBeDefined();
                expect(task.Children.length).toEqual(0);
            }
        });

        it("should build a tree three levels deep", () => {
            const taskList: Task[] = [];

            // Level 1
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProject"));

            // Level 2
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "TaskOne:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "TaskOne:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "TaskOne:SubTaskThree", "SampleProject"));

            // Level 3
            taskList.push(new Task("00000000-0000-0000-0000-000000000013", "TaskOne:SubTaskOne:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000014", "TaskOne:SubTaskOne:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000015", "TaskOne:SubTaskOne:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000016", "TaskOne:SubTaskTwo:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000017", "TaskOne:SubTaskTwo:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000018", "TaskOne:SubTaskTwo:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000019", "TaskOne:SubTaskThree:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000020", "TaskOne:SubTaskThree:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000021", "TaskOne:SubTaskThree:SubSubTaskThree", "SampleProject"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.IsLeafNode).toBeFalsy();
            expect(tree.RootNode.Children.length).toEqual(3);

            for (const task of tree.RootNode.Children) {
                expect(task).toBeDefined();
                expect(task.IsLeafNode).toBeFalsy();
                expect(task.Children).toBeDefined();
                expect(task.Children.length).toEqual(3);

                for (const subTask of task.Children) {
                    expect(subTask).toBeDefined();
                    expect(subTask.IsLeafNode).toBeTruthy();
                    expect(subTask.Children).toBeDefined();
                    expect(subTask.Children.length).toEqual(0);
                }
            }
        });
    });
});
