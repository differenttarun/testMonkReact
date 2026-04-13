import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const ExpectedResultPage = () => {
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editResult, setEditResult] = useState(null);

  const [formData, setFormData] = useState({
    testCaseId: "",
    env: "DEV",
    activityName: "",
    value: "",
  });

  const baseUrl = "http://localhost:5001/api/vi/expectedresult";

  // 🔹 Fetch all
  const fetchResults = async () => {
    try {
      const res = await fetch(`${baseUrl}/fetchAllExpectedResults`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setResults(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // 🔹 Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 🔹 Add
  const handleAdd = () => {
    setEditResult(null);
    setFormData({
      testCaseId: "",
      env: "DEV",
      activityName: "",
      value: "",
    });
    setShowModal(true);
  };

  // 🔹 Edit
  const handleEdit = (item) => {
    setEditResult(item);
    setFormData({
      testCaseId: item.testCaseId,
      env: item.env,
      activityName: item.activityName,
      value: item.value,
    });
    setShowModal(true);
  };

  // 🔹 Save
  const handleSave = async () => {
    try {
      const url = editResult
        ? `${baseUrl}/update/${editResult.expectedResultId}`
        : `${baseUrl}/create`;

      const method = editResult ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          testCaseId: Number(formData.testCaseId),
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      setShowModal(false);
      fetchResults();
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

      fetchResults();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Expected Results</h3>
        <Button variant="primary" onClick={handleAdd}>
          New Expected Result
        </Button>
      </div>

      {/* 🔹 Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Test Case ID</th>
            <th>Env</th>
            <th>Activity</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {results.map((item) => (
            <tr key={item.expectedResultId}>
              <td>{item.expectedResultId}</td>
              <td>{item.testCaseId}</td>
              <td>{item.env}</td>
              <td>{item.activityName}</td>
              <td>{item.value}</td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(item.expectedResultId)}
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
            {editResult ? "Update Expected Result" : "Add Expected Result"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Test Case ID</Form.Label>
              <Form.Control
                name="testCaseId"
                value={formData.testCaseId}
                onChange={handleChange}
                placeholder="Enter Test Case ID"
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

            <Form.Group className="mb-2">
              <Form.Label>Activity Name</Form.Label>
              <Form.Control
                name="activityName"
                value={formData.activityName}
                onChange={handleChange}
                placeholder="Enter activity name"
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
                placeholder="Enter expected result"
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

export default ExpectedResultPage;
