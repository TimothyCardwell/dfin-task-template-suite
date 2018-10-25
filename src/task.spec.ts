import { Task } from "./task";

describe("task", () => {

    describe("can be constructed", () => {

        it("should be created successfully", () => {
            const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", "Path1:Path2:Path3:Path4", "Some project");
            expect(task).toBeDefined();
            expect(task.Id).toEqual("65f60d0c-7e76-40ef-a336-f2167fab7874");
            expect(task.Path).toEqual("Path1:Path2:Path3:Path4");
            expect(task.Project).toEqual("Some project");
            // Name and RootTask Assertions below
        });

        describe("can handle root templates", () => {

            it("should define tasks starting with tt_ as root tasks", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "tt_This is a root task!", "Some project");

                expect(task.IsRootTask).toBeTruthy();
            });

            it("should trim the beginning of a root tasks name", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "tt_This is a root task!", "Some project");

                expect(task.Name).toEqual("This is a root task!");
            });

            it("should set the path to the name with tt_ trimmed", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "tt_This is a root task!", "Some project");

                expect(task.Path).toEqual("This is a root task!");
            });
        });

        describe("can handle non-root templates", () => {

            it("should not define tasks not starting with tt_ as root tasks", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "This is a non-root task!", "Some project");

                expect(task.IsRootTask).toBeFalsy();
            });

            it("should remove all path information from the name", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "Path1:Path2:Path3:Path4:TaskName", "Some project");

                expect(task.Name).toEqual("TaskName");
            });

            it("should set the path to the name pre-parsed", () => {
                const task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874",
                    "Path1:Path2:Path3:Path4:TaskName", "Some project");

                expect(task.Path).toEqual("Path1:Path2:Path3:Path4:TaskName");
            });
        });

        describe("can handle bad input", () => {

            it("should throw when created with an empty id", () => {
                expect(() => new Task("", "This is a task!", "Some project")).toThrowError();
            });

            it("should throw when created with an undefined id", () => {
                expect(() => new Task(null, "This is a task!", "Some project")).toThrowError();
            });

            it("should throw when created with an empty name", () => {
                expect(() => new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", "", "Some project")).toThrowError();
            });

            it("should throw when created with an undefined name", () => {
                expect(() => new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", null, "Some project")).toThrowError();
            });

            it("should throw when created with an empty project id", () => {
                expect(() => new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", "This is a task!", "")).toThrowError();
            });

            it("should throw when created with an undefined project id", () => {
                expect(() => new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", "This is a task!", null)).toThrowError();
            });
        });
    });
});
