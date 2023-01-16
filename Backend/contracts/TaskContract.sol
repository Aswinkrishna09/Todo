// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract TaskContract {
    event AddTask(address recipient, uint256 taskId);
    event DeleteTask(uint256 taskId, bool isDeleted);
    struct Task {
        uint256 taskId;
        string taskText;
        uint256 priority;
        bool isDeleted;
    }
    mapping(address => Task[]) allTasks;

    function addTask(string memory _taskText, bool _isDeleted) external {
        allTasks[msg.sender].push(
            Task({
                taskId: allTasks[msg.sender].length + 1,
                taskText: _taskText,
                priority: allTasks[msg.sender].length + 1,
                isDeleted: _isDeleted
            })
        );
        // uint256 taskId = tasks.length;
        // tasks.push(Task(taskId, _taskText, _isDeleted));
        // taskToOwner[taskId] = msg.sender;
        emit AddTask(msg.sender, allTasks[msg.sender].length);
    }

    function changePriority(uint256[] memory id, uint256[] memory _priority)
        public
    {
        for (uint256 i = 0; i < id.length; i++) {
             allTasks[msg.sender][id[i]] = allTasks[msg.sender][_priority[i]] ;
        }
    }

    function getAllTasks() external view returns (Task[] memory) {
        uint256 counter = 0;

        for (uint256 i = 0; i < allTasks[msg.sender].length; i++) {
            if (allTasks[msg.sender][i].isDeleted == false) {
                counter++;
            }
        }

        Task[] memory results = new Task[](counter);

        for (uint256 i = 0; i < counter; i++) {
            if (allTasks[msg.sender][i].isDeleted == false) {
                results[i] = Task({
                    taskId: allTasks[msg.sender][i].taskId,
                    taskText: allTasks[msg.sender][i].taskText,
                    priority: allTasks[msg.sender][i].priority,
                    isDeleted: allTasks[msg.sender][i].isDeleted
                });
            }
        }

        return results;
    }

    function deleteTask(uint256 _taskId) external {
        for (uint256 i = 0; i < allTasks[msg.sender].length; i++) {
            if (allTasks[msg.sender][i].taskId == _taskId) {
                allTasks[msg.sender][i].isDeleted = true;
            }
        }
    }
}
