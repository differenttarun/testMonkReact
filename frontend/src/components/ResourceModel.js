import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const ResourceModelPage = () => {
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModel, setEditModel] = useState(null);

  const [formData, setFormData] = useState({
    modelName: "",
    key: "",
    value: "",
    env: "DEV",
  });

  // 🔹 Fetch all
  const fetchModels = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/vi/resourceModel/fetchAll",
      );
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setModels(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // 🔹 Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Add
  const handleAdd = () => {
    setEditModel(null);
    setFormData({
      modelName: "",
      key: "",
      value: "",
      env: "DEV",
    });
    setShowModal(true);
  };

  // 🔹 Edit
  const handleEdit = (model) => {
    setEditModel(model);
    setFormData(model);
    setShowModal(true);
  };

  // 🔹 Save
  const handleSave = async () => {
    try {
      const url = editModel
        ? `http://localhost:5001/api/vi/resourceModel/update/${editModel.resourceModelId}`
        : "http://localhost:5001/api/vi/resourceModel/create";

      const method = editModel ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Save failed");

      setShowModal(false);
      fetchModels();
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/resourceModel/delete/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      fetchModels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Resource Models</h3>
        <Button variant="primary" onClick={handleAdd}>
          + Add Resource Model
        </Button>
      </div>

      {/* 🔹 Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Model Name</th>
            <th>Key</th>
            <th>Value</th>
            <th>Env</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {models.map((model) => (
            <tr key={model.resourceModelId}>
              <td>{model.resourceModelId}</td>
              <td>{model.modelName}</td>
              <td>{model.key}</td>
              <td>{model.value}</td>
              <td>{model.env}</td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(model)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(model.resourceModelId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* 🔹 Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editModel ? "Update Resource Model" : "Add Resource Model"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Model Name</Form.Label>
              <Form.Control
                name="modelName"
                value={formData.modelName}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Key</Form.Label>
              <Form.Control
                name="key"
                value={formData.key}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Value</Form.Label>
              <Form.Control
                name="value"
                value={formData.value}
                onChange={handleChange}
              />
            </Form.Group>

            {/* 🔹 Env Dropdown */}
            <Form.Group className="mb-2">
              <Form.Label>Env</Form.Label>
              <Form.Select
                name="env"
                value={formData.env}
                onChange={handleChange}
              >
                <option value="QA">QA</option>
                <option value="DEV">DEV</option>
                <option value="UAT">UAT</option>
                <option value="PROD">PROD</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ResourceModelPage;
