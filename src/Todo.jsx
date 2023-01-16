import React, { useCallback, useRef, useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { ethers } from "ethers";
import { TaskContractAddress } from "./config";
import TaskAbi from "./TaskContract.json";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import update from "immutability-helper";

let ABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_taskText",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "_isDeleted",
				"type": "bool"
			}
		],
		"name": "addTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "recipient",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
				"type": "uint256"
			}
		],
		"name": "AddTask",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "id",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "_priority",
				"type": "uint256[]"
			}
		],
		"name": "changePriority",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_taskId",
				"type": "uint256"
			}
		],
		"name": "deleteTask",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "taskId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "bool",
				"name": "isDeleted",
				"type": "bool"
			}
		],
		"name": "DeleteTask",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "allTasks",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "taskId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "taskText",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "priority",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "isDeleted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAllTasks",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "taskId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "taskText",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "priority",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isDeleted",
						"type": "bool"
					}
				],
				"internalType": "struct TaskContract.Task[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const type = "DraggableBodyRow";
const DraggableBodyRow = ({
  index,
  moveRow,
  className,
  style,
  ...restProps
}) => {
  const ref = useRef(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName:
          dragIndex < index ? " drop-over-downward" : " drop-over-upward",
      };
    },
    drop: (item) => {
      moveRow(item.index, index);
    },
  });
  const [, drag] = useDrag({
    type,
    item: {
      index,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ""}`}
      style={{
        cursor: "move",
        ...style,
      }}
      {...restProps}
    />
  );
};

const columns = [
  {
    title: "Name",
    dataIndex: "taskText",
    key: "taskText",
  },
];
function Todo() {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [todo, setTodo] = useState({
    taskText: "",
    isDeleted: false,
  });
  useEffect(() => {
    getTodos();
  }, []);

  const [todos, setTodos] = useState([]);
  const [tempTodos, setTempTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const addTodo = async (e) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log(ethers);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          ABI,
          signer
        );
        console.log("adding todo....... ", todo.taskText, " ", todo.isDeleted);
        await TaskContract.addTask(todo.taskText, todo.isDeleted);
        let res = await TaskContract.getAllTasks();
        console.log("tasks ", res);
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        setTodos(res);
        setTempTodos(res);
        form.setFieldsValue({
          todoinp: "",
        });
      } else {
        console.log("Ethereum object didn't find");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTodos = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log(ethers);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        let res = await TaskContract.getAllTasks();
        console.log("tasks ", res);
        setTodos(res);
        setTempTodos(res);
      } else {
        console.log("Ethereum object didn't find");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const deleteTodo = async (id) => {
    console.log(id);
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log(ethers);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        await TaskContract.deleteTask(id);
        console.log("deleted");
        let res = await TaskContract.getAllTasks();
        console.log("tasks ", res);
        setTodos(res);
        setTempTodos(res);
      } else {
        console.log("Ethereum object didn't find");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const components = {
    body: {
      row: DraggableBodyRow,
    },
  };
  const moveRow = useCallback(
    (dragIndex, hoverIndex) => {
      const dragRow = todos[dragIndex];
      setTodos(
        update(todos, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow],
          ],
        })
      );
    },
    [todos]
  );

  const exchangePriority = async (main, change) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        console.log(ethers);
        const signer = provider.getSigner();
        const TaskContract = new ethers.Contract(
          TaskContractAddress,
          TaskAbi.abi,
          signer
        );
        await TaskContract.changePriority(main, change);
        setTimeout(() => {
          setLoading(false);
        }, 4000);
        // console.log("tasks ", res);
        // setTodos(res);
        // setTempTodos(res)
      } else {
        setLoading(true);
        console.log("Ethereum object didn't find");
      }
    } catch (error) {
      setLoading(true);
      console.log(error);
    }
  };

  const Compute = () => {
    setLoading(true);
    let main = [];
    let change = [];
    tempTodos.map((data) => main.push(data.taskId.toNumber()));
    todos.map((data) => change.push(data.taskId.toNumber()));
    console.log("temp todos ", main);
    console.log("todos ", change);
    exchangePriority(main, change);
  };
  return (
    <React.Fragment>
      <Col span={16}>
        <Row style={{ margin: "10px" }} justify="space-between">
          <Col span={8}>
            <h1>Todo App</h1>
          </Col>
          <Col span={16}>
            <Row justify="end">
              <Space>
                <Badge status="success" text="Completed" />
                <Badge status="warning" text="Pending" />
              </Space>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={16}>
        <Form form={form} onFinish={addTodo}>
          <Form.Item
            name="todoinp"
            rules={[
              {
                required: true,
                message: "Please input your todo!",
              },
            ]}
          >
            <Input
              className="todo-inp"
              name="edittodoinp"
              placeholder="Please enter todos"
              value={todo.text}
              onChange={(e) => {
                setTodo((prev) => ({ ...prev, taskText: e.target.value }));
              }}
            />
          </Form.Item>
        </Form>
      </Col>
      <Col style={{ margin: "15px" }} span={16}>
        <Button onClick={() => setOpen(true)}>Priortice task</Button>
      </Col>
      <Modal
        title="You can drag this list and prioritice task"
        centered
        open={open}
        onOk={() => Compute()}
        onCancel={() => setOpen(false)}
        width={1000}
      >
        <DndProvider backend={HTML5Backend}>
          <Table
            loading={loading}
            pagination={false}
            columns={columns}
            dataSource={todos}
            components={components}
            onRow={(_, index) => {
              const attr = {
                index,
                moveRow,
              };
              return attr;
            }}
          />
        </DndProvider>
      </Modal>
      <Col style={{ margin: "15px" }} span={16}>
        {todos.map((e, i) => (
          <Col key={e.taskId} span={24} style={{ margin: "10px" }}>
            <Alert
              message={e.taskText}
              type={"success"}
              showIcon
              action={
                <React.Fragment>
                  <Popconfirm
                    title="Are you sure to delete this todo?"
                    onConfirm={() => {
                      // setTodos(todos.filter((evt, ind) => ind !== i));
                      deleteTodo(e.taskId);
                    }}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small" type="text">
                      <DeleteOutlined />
                    </Button>
                  </Popconfirm>
                </React.Fragment>
              }
            />
          </Col>
        ))}
      </Col>
    </React.Fragment>
  );
}

export default Todo;
