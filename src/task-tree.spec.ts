import { Task } from "./task";
import { TaskTree } from "./task-tree";

// tslint:disable:max-line-length
describe("task-tree", () => {

    describe("can be constructed", () => {

        it("should be created successfully", () => {
            const taskList: Task[] = [];
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_SampleTaskOneName", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_SampleTaskTwoName", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "tt_SampleTaskThreeName", "SampleProjectName"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.Task.Id).toEqual("00000000-0000-0000-0000-000000000000");
        });

        it("should throw for a null task list", () => {
            expect(() => new TaskTree(null)).toThrowError();
        });

        it("should allow empty task list", () => {
            // Empty list is allowed so that tasking helper methods is easier later
            // There is no real functionality that requires an empty task list to be supported
            const tree = new TaskTree([]);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.Task.Id).toEqual("00000000-0000-0000-0000-000000000000");
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
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_TaskTwo", "SampleProjectName"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "tt_TaskThree", "SampleProjectName"));

            const tree = new TaskTree(taskList);
            expect(tree).toBeDefined();
            expect(tree.RootNode).toBeDefined();
            expect(tree.RootNode.IsLeafNode).toBeFalsy();
            expect(tree.RootNode.Children.length).toEqual(3);

            for (const childNode of tree.RootNode.Children) {
                expect(childNode).toBeDefined();
                expect(childNode.IsLeafNode).toBeTruthy();
                expect(childNode.Children).toBeDefined();
                expect(childNode.Children.length).toEqual(0);
            }
        });

        it("should build a tree two levels deep", () => {
            const taskList: Task[] = [];

            // Level 1
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_TaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "tt_TaskThree", "SampleProject"));

            // Level 2
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "TaskOne:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "TaskOne:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "TaskOne:SubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000007", "TaskTwo:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000008", "TaskTwo:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000009", "TaskTwo:SubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000010", "TaskThree:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000011", "TaskThree:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000012", "TaskThree:SubTaskThree", "SampleProject"));

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

        it("should build a tree three levels deep", () => {
            const taskList: Task[] = [];

            // Level 1
            taskList.push(new Task("00000000-0000-0000-0000-000000000001", "tt_TaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000002", "tt_TaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000003", "tt_TaskThree", "SampleProject"));

            // Level 2
            taskList.push(new Task("00000000-0000-0000-0000-000000000004", "TaskOne:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000005", "TaskOne:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000006", "TaskOne:SubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000007", "TaskTwo:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000008", "TaskTwo:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000009", "TaskTwo:SubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000010", "TaskThree:SubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000011", "TaskThree:SubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000012", "TaskThree:SubTaskThree", "SampleProject"));

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
            taskList.push(new Task("00000000-0000-0000-0000-000000000022", "TaskTwo:SubTaskOne:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000023", "TaskTwo:SubTaskOne:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000024", "TaskTwo:SubTaskOne:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000025", "TaskTwo:SubTaskTwo:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000026", "TaskTwo:SubTaskTwo:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000027", "TaskTwo:SubTaskTwo:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000028", "TaskTwo:SubTaskThree:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000029", "TaskTwo:SubTaskThree:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000030", "TaskTwo:SubTaskThree:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000031", "TaskThree:SubTaskOne:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000032", "TaskThree:SubTaskOne:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000033", "TaskThree:SubTaskOne:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000034", "TaskThree:SubTaskTwo:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000035", "TaskThree:SubTaskTwo:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000036", "TaskThree:SubTaskTwo:SubSubTaskThree", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000037", "TaskThree:SubTaskThree:SubSubTaskOne", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000038", "TaskThree:SubTaskThree:SubSubTaskTwo", "SampleProject"));
            taskList.push(new Task("00000000-0000-0000-0000-000000000039", "TaskThree:SubTaskThree:SubSubTaskThree", "SampleProject"));

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
                    expect(subTask.IsLeafNode).toBeFalsy();
                    expect(subTask.Children).toBeDefined();
                    expect(subTask.Children.length).toEqual(3);

                    for (const subSubTask of subTask.Children) {
                        expect(subSubTask).toBeDefined();
                        expect(subSubTask.IsLeafNode).toBeTruthy();
                        expect(subSubTask.Children).toBeDefined();
                        expect(subSubTask.Children.length).toEqual(0);
                    }
                }
            }
        });
    });
});
