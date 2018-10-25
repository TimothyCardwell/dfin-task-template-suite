import { Node } from "./node";
import { Task } from "./task";

describe("node", () => {
    let task: Task;

    beforeEach(() => {
        task = new Task("65f60d0c-7e76-40ef-a336-f2167fab7874", "Path1:Path2", "Some project");
    });

    describe("can be constructed", () => {

        it("should be created successfully", () => {
            const node = new Node(task);
            expect(node).toBeDefined();
            expect(node.Task).toBeDefined();
            expect(node.Task).toEqual(task);
            expect(node.IsLeafNode).toBeDefined();
            expect(node.IsLeafNode).toBeTruthy();
            expect(node.Children).toBeDefined();
            expect(node.Children.length).toEqual(0);
        });

        it("should throw for a null task", () => {
            expect(() => new Node(null)).toThrowError();
        });
    });

    describe("can add child nodes", () => {

        it("should add child node", () => {
            const rootNode = new Node(task);
            const childNode = new Node(task);
            rootNode.AddChildNode(childNode);

            expect(rootNode.Children.length).toEqual(1);
            expect(rootNode.IsLeafNode).toBeFalsy();
        });

        it("should not add the same child twice", () => {
            const rootNode = new Node(task);
            const childNode = new Node(task);
            rootNode.AddChildNode(childNode);
            rootNode.AddChildNode(childNode);

            expect(rootNode.Children.length).toEqual(1);
        });

        it("should error when adding a null child", () => {
            const rootNode = new Node(task);
            expect(() => rootNode.AddChildNode(null)).toThrowError();
        });
    });
});
