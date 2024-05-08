import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import "./App.css";
import db from "./firebase";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [users, setUsers] = useState([]);
  const [counter, setCounter] = useState(1); // Counter variable for generating IDs
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    roles: [],
  });

  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);

  useEffect(() => {
    const fetchUsersFromFirestore = async () => {
      try {
        const colRef = collection(db, "users");
        const snapshot = await getDocs(colRef);
        const userData = snapshot.docs.map((doc) => ({
          id: parseInt(doc.id), // Parse ID to integer
          ...doc.data(),
        }));
        console.log("Fetched users:", userData);
        setUsers(userData);

        // Determine the maximum ID value
        const maxId = userData.reduce((max, user) => Math.max(max, user.id), 0);
        // Set counter to start from the maximum ID value + 1
        setCounter(maxId + 1);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };

    fetchUsersFromFirestore();
  }, []);

  const addUserToFirestore = async (formData) => {
    try {
      const id = editingUserId ? editingUserId : uuidv4();
      await setDoc(doc(db, "users", id.toString()), formData);
      console.log("Document written with ID: ", id);
      return id;
    } catch (error) {
      console.error("Error adding document: ", error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      // If checkbox, handle selection
      if (checked) {
        setFormData({
          ...formData,
          roles: [...formData.roles, value],
        });
      } else {
        setFormData({
          ...formData,
          roles: formData.roles.filter((role) => role !== value),
        });
      }
    } else {
      // For other inputs, update form data
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        gender: userToEdit.gender,
        roles: userToEdit.roles,
      });
      setEditingUserId(userId);
    }
  };

  const handleDelete = async (userId) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "users", deleteUserId));
      const updatedUsers = users.filter((user) => user.id !== deleteUserId);
      setUsers(updatedUsers);
      setDeleteUserId(null); // Reset deleteUserId after deletion
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredFormData = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        if (value !== "" && (key !== "roles" || value.length > 0)) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    console.log("Form data:", filteredFormData);
    // Here you can send the filtered form data to Firebase or perform other operations
    const docId = await addUserToFirestore(formData);
    if (docId) {
      // Fetch the updated user data and set it to the state
      const updatedUsers = [...users, { id: counter, ...formData }];
      setUsers(updatedUsers);
      setCounter(counter + 1); // Increment the counter after adding a new user
      setEditingUserId(null); // Reset editingUserId after adding or updating user
    }
  };

  return (
    <div className="App">
      <h1 className="mb-2 mt-5">User collections from firebase</h1>
      <h4 className="mb-5">and also we can add users to the firebase</h4>
      <form
        className="container"
        style={{ width: 380 }}
        onSubmit={handleSubmit}
      >
        <div className="mb-3">
          <label htmlFor="exampleInputName" className="form-label">
            Name:
          </label>
          <input
            type="text"
            className="form-control"
            id="exampleInputName"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="exampleInputGender" className="form-label">
            Gender:
          </label>
          <select
            className="form-select form-select-md mb-3"
            id="exampleInputGender"
            aria-label=".form-select-lg example"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select option</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-3 d-flex justify-content-between">
          {/* Role checkboxes */}
          <div className="">
            <label htmlFor="PrimeAdmin" className="form-check-label font-size">
              <input
                type="checkbox"
                className="form-check-input"
                id="PrimeAdmin"
                name="PrimeAdmin"
                value="PrimeAdmin"
                onChange={handleChange}
                checked={formData.roles.includes("PrimeAdmin")}
              />
              PrimeAdmin
            </label>
          </div>
          <div className="">
            <label htmlFor="Super Admin" className="form-check-label font-size">
              <input
                type="checkbox"
                className="form-check-input"
                id="Super Admin"
                name="Super Admin"
                value="Super Admin"
                onChange={handleChange}
                checked={formData.roles.includes("Super Admin")}
              />
              SuperAdmin
            </label>
          </div>
          <div className="">
            <label htmlFor="Admin" className="form-check-label font-size">
              <input
                type="checkbox"
                className="form-check-input"
                id="Admin"
                name="Admin"
                value="Admin"
                onChange={handleChange}
                checked={formData.roles.includes("Admin")}
              />
              Admin
            </label>
          </div>
          <div className="">
            <label htmlFor="Worker" className="form-check-label font-size">
              <input
                type="checkbox"
                className="form-check-input"
                id="Worker"
                name="Worker"
                value="Worker"
                onChange={handleChange}
                checked={formData.roles.includes("Worker")}
              />
              Worker
            </label>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
        {editingUserId && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleSubmit}
          >
            Save
          </button>
        )}
      </form>

      {/* Table data */}

      <h3 className="mt-5">Table data</h3>
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col-3">#</th>
            <th scope="col-3">Name</th>
            <th scope="col-3">Gender</th>
            <th scope="col-3">Role</th>
            <th scope="col-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <th scope="row">{user.id}</th>
              <td>{user.name}</td>
              <td>{user.gender}</td>
              <td>{user.roles.join(", ")}</td>
              <td>
                <button
                  className="btn btn-primary me-2"
                  onClick={() => handleEdit(user.id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {deleteUserId && (
        <div className="modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this user?</p>
            <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            <button className="btn btn-secondary" onClick={() => setDeleteUserId(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;