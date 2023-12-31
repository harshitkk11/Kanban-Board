import axios from "axios"
import { useContext, useState, useEffect } from "react"
import { UserContext } from "../contexts/UserContext"
import { useNavigate } from "react-router-dom"
import { MdArrowBack, MdClose, MdDeleteOutline } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { FiEdit2 } from "react-icons/fi";
import toast from 'react-hot-toast'
import { Dialog } from 'primereact/dialog';
import { Button } from "primereact/button";
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';


const Board = () => {
    const navigate = useNavigate()
    const [loader, setLoader] = useState("flex");

    // get the username from the user state set on login page
    const { user } = useContext(UserContext);
    const username = user.username

    // boards stores the all boards data from the database in useeffect (line: 75)
    const [boards, setBoards] = useState()

    // board id stored in localstorage in dashboard when click on the 
    // board card, used to find the data of that board from the boards above
    const boardid = localStorage.getItem("board")

    // board stores all the data of the board found with the help of boardid (line: 89)
    const [board, setBoard] = useState(null)
    const currentname = board?.boardname
    const [newname, setNewname] = useState(currentname)
    
    // titledata is used to send the data of a task from the inputs to database
    // in handleSubmit function (line: 48)

    const [taskisOpen, setTaskisOpen] = useState({
        path: "",
        heading: "",
        title: "",
        description: "",
        id: "",
        btnvalue: ""
    });
    const [boardisopen, setBoardisopen] = useState(false);
    const [deletepath, setDeletepath] = useState("/deleteboard")

    // handle's BACK button in the board-nav div (line: 97)
    const handleBackbtn = (e) => {
        e.preventDefault()
        navigate("/")
    }

    // handle's EDIT button in the board-nav div (line: 170)
    const handleEdit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post("/updateboard", {
                username,
                boardid,
                newname
            })
            if (response) {
                setBoardisopen(false)
                setNewname("")
                window.location.reload()
            }
        } catch (error) {
            toast.error("Something went wrong!!")
            console.log(error)
        }
    }

    // handle's DELETE button in the board-nav div (line: 152)
    const handleDelete = async () => {
        const id = taskisOpen.id
        // e.preventDefault()
        try {
            const response = await axios.post(deletepath, {
                username,
                boardid,
                id
            })
            if (response) {
                setTaskisOpen("")
                setDeletepath("/deleteboard")
                if (deletepath === "/deleteboard")
                    navigate("/")
                else
                window.location.reload()
            }
        } catch (error) {
            toast.error("Something went wrong!!")
            console.log(error)
        }
    }

    const confirm = () => {
        confirmDialog({
            message: 'Do you want to delete this Board?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
            acceptClassName: 'p-button-danger',
            accept: handleDelete
        });
    };

    // handle's CREATE button in the lists (line: 241)
    const handleSubmit = async (e) => {
        e.preventDefault()
        const title = taskisOpen.title
        const description = taskisOpen.description
        const path = taskisOpen.path
        const id = taskisOpen.id
        try {
            if (title.length > 0) {
                const response = await axios.post(path, {
                    username,
                    boardid,
                    title,
                    description,
                    id
                })

                if (response.data) {
                    setTaskisOpen("")
                    window.location.reload()
                }
            }
        } catch (error) {
            toast.error("Something went wrong!!")
            console.log(error)
        }
    }

    const onDragOver = (ev) => {
        ev.preventDefault();
    }

    const onDragStart = (ev, dragid, title, description, path) => {
        ev.dataTransfer.setData("id",dragid)
        ev.dataTransfer.setData("title", title)
        ev.dataTransfer.setData("description", description)
        ev.dataTransfer.setData("path", path)
    }

    const onDrop = async (ev, path, index) => {
        const id = ev.dataTransfer.getData("id")
        const deletepath = ev.dataTransfer.getData("path")
        const title = ev.dataTransfer.getData("title")
        const description = ev.dataTransfer.getData("description")
        
        try {
            const response = await axios.post(path, {
                username,
                boardid,
                title,
                description,
                index
            })

            if (response.data) {
                try {
                    const response = await axios.post(deletepath, {
                        username,
                        boardid,
                        id
                    })
                    if (response) {
                        // console.log({id, deletepath, title, description, index, path});
                        window.location.reload()
                    }
                } catch (error) {
                    toast.error("Something went wrong!!")
                    console.log(error)
                }
            }
        } catch (error) {
            toast.error("Something went wrong!!")
            console.log(error)
        }
        
    }

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.post('/getboards', {
                    username
                })

                if (response.data) {
                    setBoards(Object.values(response.data.boarddata))
                    setLoader("none")
                }
            } catch (error) {
                setLoader("none")
                toast.error("Something went wrong!!")
                console.log(error)
            }
        }
        fetchData()
    }, [username])

    useEffect(() => {
        if (boards) {
            const boarddata = boards.find(board => board._id === boardid)
            if (boarddata) {
                setBoard(boarddata)
            }
        }
        setNewname(currentname)
    }, [boards, boardid, setBoard, setNewname, currentname]);

    // Render

    return (
        <div className="board-page">
            <div className="loader-div" style={{display: loader}}>
                    <div className="loader"></div>
            </div>
            <ConfirmDialog className="p-confirm-dialog"/>
            {/* Board NAV on the bottom of the navbar containing back button, boardname, edit button and delete button*/}
            <div className="board-nav">

                {/* back button */}
                <button className="back-btn" onClick={(e) => handleBackbtn(e)}><MdArrowBack /></button>

                {/* board name */}
                <h4>{currentname}</h4>

                {/* edit button */}
                <button className="edit-board" onClick={() => setBoardisopen(true)}><FiEdit2 /></button>

                {/* delete button */}
                <button className="delete-board" onClick={() => confirm()}><MdDeleteOutline /></button>

            </div>

            {/* script for EDIT button, when clicked popup window will open to edit the board name*/}
            <Dialog 
                className="popup-div"
                header="Edit Name" 
                visible={boardisopen} 
                modal={false}
                key="enter" 
                onHide={() => setBoardisopen(false)}
                >

                {/* popup window edit form */}
                <form className="board-name-form" onSubmit={(e) => handleEdit(e)}>

                    <label htmlFor="board-name">Board title</label>
                    <input
                        id="board-name"
                        className="board-name"
                        name="board-name"
                        type="text"
                        autoComplete="off"
                        value={newname}
                        onChange={(e) => setNewname(e.target.value)}
                        required
                    />

                    <Button className="board-submit"
                        label="Save"
                        style={{width: "100%", marginTop: "20px"}}
                        autoFocus/>
                </form>
            </Dialog>

            {/* division in which the lists will be shown */}
            <div className="cards-div">
                {/* TODO list */}
                <div className="todo-list">
                    <p>TO DO</p>
                    <hr />
                    <ul className="todo-card" >
                        {board && board.todo.map((item, index) => (
                            <li key={index} 
                                draggable 
                                onDragOver={(e) => onDragOver(e)}
                                onDragStart={(e) => onDragStart(e, 
                                    item._id, 
                                    item.title, 
                                    item.description,
                                    "/deletetodo")}
                                onDrop={(e) => onDrop(e, 
                                    "/dragtodo",
                                    index)}
                            >
                                <button className="task-item" onClick={() => {
                                    setTaskisOpen({
                                        ...taskisOpen,
                                        path: "/updatetodo",
                                        heading: "Edit Task",
                                        title: item.title,
                                        description: item.description,
                                        id: item._id,
                                        btnvalue: "Save"
                                    })
                                    setDeletepath("/deletetodo")
                                }}>
                                    <h4>{item.title}</h4>
                                    {item.description && <div className="description-div">
                                        {item.description}
                                    </div>
                                    }
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button className="add-btn" onClick={() => setTaskisOpen(
                        {
                            ...taskisOpen,
                            heading: "Add task",
                            path: "/createtodo",
                            btnvalue: "Add"
                        }
                    )
                    }
                    onDragOver={(e) => onDragOver(e)}
                    onDrop={(e) => onDrop(e, 
                        "/dragtodo",
                        -1)}
                        ><FaPlus /> Add Task</button>
                </div>

                {/* INPROGRESS list */}
                <div className="inprogress-list">
                    <p>IN PROGRESS</p>
                    <hr />
                    <ul className="inprogress-card">
                        {board && board.inprogress.map((item, index) => (
                            <li key={index}
                                draggable
                                onDragOver={(e) => onDragOver(e)}
                                onDragStart={(e) => onDragStart(e, 
                                    item._id, 
                                    item.title, 
                                    item.description,
                                    "/deleteinprogress")
                                }
                                onDrop={(e) => onDrop(e, 
                                    "/draginprogress",
                                    index)
                                }
                            >
                                <button className="task-item" onClick={() => {
                                    setTaskisOpen({
                                        ...taskisOpen,
                                        path: "/updateinprogress",
                                        heading: "Edit Task",
                                        title: item.title,
                                        description: item.description,
                                        id: item._id,
                                        btnvalue: "Save"
                                    })
                                    setDeletepath("/deleteinprogress")
                                }}>
                                    <h4>{item.title}</h4>
                                    {item.description && <div className="description-div">
                                        {item.description}
                                    </div>
                                    }
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button className="add-btn" onClick={() => setTaskisOpen(
                        {
                            ...taskisOpen,
                            heading: "Add task",
                            path: "/createinprogress",
                            btnvalue: "Add"
                        }
                    )}
                    onDragOver={(e) => onDragOver(e)}
                    onDrop={(e) => onDrop(e, 
                        "/draginprogress",
                        -1)}><FaPlus /> Add Task</button>
                </div>

                {/* DONE list */}
                <div className="done-list">
                    <p>DONE</p>
                    <hr />
                    <ul className="done-card">
                        {board && board.done.map((item, index) => (
                            <li key={index}
                                draggable
                                onDragOver={(e) => onDragOver(e)}
                                onDragStart={(e) => onDragStart(e, 
                                    item._id, 
                                    item.title, 
                                    item.description,
                                    "/deletedone")}
                                onDrop={(e) => onDrop(e, 
                                    "/dragdone",
                                    index)}
                            >
                                <button className="task-item" onClick={() => {
                                    setTaskisOpen({
                                        ...taskisOpen,
                                        path: "/updatedone",
                                        heading: "Edit Task",
                                        title: item.title,
                                        description: item.description,
                                        id: item._id,
                                        btnvalue: "Save"
                                    })
                                    setDeletepath("/deletedone")
                                }}>
                                    <h4>{item.title}</h4>
                                    {item.description && <div className="description-div">
                                        {item.description}
                                    </div>
                                    }
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button className="add-btn" onClick={() => setTaskisOpen(
                        {
                            ...taskisOpen,
                            heading: "Add task",
                            path: "/createdone",
                            btnvalue: "Add"
                        }
                    )}
                    onDragOver={(e) => onDragOver(e)}
                    onDrop={(e) => onDrop(e, 
                        "/dragdone",
                        -1)}><FaPlus /> Add Task</button>
                </div>

                {/* script for ADD BUTTON to add the task in the list */}
                {taskisOpen.path && (
                    <div className="task-popup-div">

                        <div className="task-popup-top">
                            <p>{taskisOpen.heading}</p>
                            <button className="task-popup-close" onClick={() => setTaskisOpen("")}>
                                <MdClose />
                            </button>
                        </div>
                        <br />

                        {/* pop window form */}
                        <form className="task-form" onSubmit={handleSubmit}>

                            <label htmlFor="task-title">Title</label>
                            <input
                                id="task-title"
                                className="task-title"
                                name="task-title"
                                type="text"
                                value={taskisOpen.title}
                                placeholder="Enter Title"
                                onChange={(e) => setTaskisOpen({ ...taskisOpen, title: e.target.value })}
                                required
                            />

                            <label htmlFor="task-description">Description</label>
                            <textarea
                                id="task-description"
                                className="task-description"
                                name="task-description"
                                autoComplete="off"
                                value={taskisOpen.description}
                                placeholder="Enter description..."
                                onChange={(e) => setTaskisOpen({ ...taskisOpen, description: e.target.value })}
                            />

                            <input id="task-submit" className="task-submit"
                                name="task-submit" type="submit" value={taskisOpen.btnvalue} />
                        </form>
                        {taskisOpen.heading === "Edit Task" && <button className="task-delete-btn" onClick={(e) => {
                            handleDelete(e)
                        }}>
                            Delete
                        </button>
                        }
                    </div>
                )}

            </div>
        </div>
    )
}

export default Board