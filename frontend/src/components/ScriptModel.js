import { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const ScriptModel = () => {
  const [models, setModels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editModel, setEditModel] = useState(null);

  const [formData, setFormData] = useState({
    modelName: "",
    key: "",
    value: "",
  });

  const baseUrl = "http://localhost:5001/api/vi/scriptmodel";

  // 🔹 Fetch all models
  const fetchModels = async () => {
    try {
      const res = await fetch(`${baseUrl}/fetchAll`);
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

  // 🔹 Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Open Add Modal
  const handleAdd = () => {
    setEditModel(null);
    setFormData({
      modelName: "",
      key: "",
      value: "",
    });
    setShowModal(true);
  };

  // 🔹 Open Edit Modal
  const handleEdit = (model) => {
    setEditModel(model);
    setFormData({
      modelName: model.modelName,
      key: model.key,
      value: model.value,
    });
    setShowModal(true);
  };

  // 🔹 Save (Create / Update)
  const handleSave = async () => {
    try {
      const url = editModel
        ? `${baseUrl}/update/${editModel.scriptModelId}`
        : `${baseUrl}/create`;

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
      const res = await fetch(`${baseUrl}/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      fetchModels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Script Models</h3>
        <Button variant="primary" onClick={handleAdd}>
          New Script Model
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
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {models.map((model) => (
            <tr key={model.scriptModelId}>
              <td>{model.scriptModelId}</td>
              <td>{model.modelName}</td>
              <td>{model.key}</td>
              <td>{model.value}</td>

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
                  onClick={() => handleDelete(model.scriptModelId)}
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
            {editModel ? "Update Script Model" : "Add Script Model"}
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
                placeholder="Enter model name"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Key</Form.Label>
              <Form.Control
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="Enter key"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Value</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="value"
                value={formData.value}
                onChange={handleChange}
                placeholder="Enter value / script"
              />
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

export default ScriptModel;
