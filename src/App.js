import React, { useEffect, useState } from "react";
import { addDoc, collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import "./App.css"; // You can define custom CSS styles for the modal
import db from "./firebase";

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    roles: [],
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null); // State to store user ID for deletion
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    const fetchUsersFromFirestore = async () => {
      try {
        const colRef = collection(db, "users");
        const snapshot = await getDocs(colRef);
        const userData = snapshot.docs.map((doc) => {
          const id = doc.id;
          const data = {
            id,
            ...doc.data(),
          };
          return data;
        });
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users: ", error);
      }
    };
    fetchUsersFromFirestore();
  }, []);

  const addUserToFirestore = async (formData) => {
    try {
      const docRef = await addDoc(collection(db, "users"), formData);
      console.log("Document written with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding document: ", error);
      return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
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
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user.id === userId);
    if (userToEdit) {
      setEditingUserId(userId);
      setFormData({
        name: userToEdit.name,
        gender: userToEdit.gender,
        roles: userToEdit.roles,
      });
    } else {
      console.error("User not found for editing");
    }
  };

  const handleCancel = () => {
    setEditingUserId(null);
    setFormData({
      name: "",
      gender: "",
      roles: [],
    });
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async () => {
    try {
      // Delete the user from the Firestore database
      await deleteDoc(doc(db, "users", deleteUserId));
      // Remove the user from the local state
      const updatedUsers = users.filter((user) => user.id !== deleteUserId);
      setUsers(updatedUsers);
      // Close the modal
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting user: ", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.gender || formData.roles.length === 0) {
      alert("Please fill out all required fields.");
      return;
    }

    const filteredFormData = Object.entries(formData).reduce(
      (acc, [key, value]) => {
        if (value !== "" && (key !== "roles" || value.length > 0)) {
          acc[key] = value;
        }
        return acc;
      },
      {}
    );

    if (editingUserId) {
      try {
        await setDoc(doc(db, "users", editingUserId), filteredFormData);
        const updatedUsers = users.map((user) =>
          user.id === editingUserId
            ? { id: editingUserId, ...filteredFormData }
            : user
        );
        setUsers(updatedUsers);
        setEditingUserId(null);
      } catch (error) {
        console.error("Error updating user details in Firestore: ", error);
      }
    } else {
      const docId = await addUserToFirestore(filteredFormData);
      if (docId) {
        const updatedUsers = [...users, { id: docId, ...filteredFormData }];
        setUsers(updatedUsers);
      }
    }
    setFormData({
      name: "",
      gender: "",
      roles: [],
    });
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
          {editingUserId ? "Save" : "Submit"}
        </button>
        {editingUserId && (
          <button
            type="button"
            className="btn btn-secondary ms-3"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </form>

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
          {users.map((user, index) => (
            <tr key={user.id}>
              <th scope="row">{index + 1}</th>
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
                  onClick={() => {
                    setDeleteUserId(user.id);
                    setShowModal(true);
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Delete User</h2>
            <p className="modal-message">Are you sure you want to delete this user?</p>
            <div className="modal-buttons">
              <button onClick={handleCloseModal} className="btn btn-secondary">Close</button>
              <button onClick={handleDelete}className="btn btn-primary">Yes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
