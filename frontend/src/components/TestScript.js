import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";

const TestScriptPage = () => {
  const [scripts, setScripts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editScript, setEditScript] = useState(null);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);

  const [formData, setFormData] = useState({
    testScriptName: "",
  });

  const baseUrl = "http://localhost:5001/api/vi/testscript";

  const fetchActivities = async (scriptId) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/activity/fetchActivityByTestScriptId/${scriptId}`,
      );

      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();
      setActivities(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewActivities = async (script) => {
    setSelectedScript(script);
    await fetchActivities(script.testScriptId);
    setShowActivityModal(true);
  };

  // 🔹 Fetch all scripts
  const fetchScripts = async () => {
    try {
      const res = await fetch(`${baseUrl}/fetchAllTestScript`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setScripts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScripts();
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
    setEditScript(null);
    setFormData({ testScriptName: "" });
    setShowModal(true);
  };

  // 🔹 Edit
  const handleEdit = (script) => {
    setEditScript(script);
    setFormData({
      testScriptName: script.testScriptName,
    });
    setShowModal(true);
  };

  // 🔹 Save
  const handleSave = async () => {
    try {
      const url = editScript
        ? `${baseUrl}/update/${editScript.testScriptId}`
        : `${baseUrl}/create`;

      const method = editScript ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Save failed");

      setShowModal(false);
      fetchScripts();
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

      fetchScripts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      {/* 🔹 Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Test Scripts</h3>
        <Button variant="primary" onClick={handleAdd}>
          New Test Script
        </Button>
      </div>

      {/* 🔹 Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Test Script Name</th>
            <th>Created Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {scripts.map((script) => (
            <tr key={script.testScriptId}>
              <td>{script.testScriptId}</td>
              <td>{script.testScriptName}</td>
              <td>{new Date(script.createdDate).toLocaleString()}</td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  className="me-2"
                  onClick={() => handleEdit(script)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="info"
                  className="me-2"
                  onClick={() => handleViewActivities(script)}
                >
                  Activities
                </Button>

                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(script.testScriptId)}
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
            {editScript ? "Update Test Script" : "Add Test Script"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Test Script Name</Form.Label>
              <Form.Control
                name="testScriptName"
                value={formData.testScriptName}
                onChange={handleChange}
                placeholder="Enter script name"
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
      <Modal
        show={showActivityModal}
        onHide={() => setShowActivityModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Activities - {selectedScript?.testScriptName}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {activities.length === 0 ? (
            <p>No activities found</p>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Activity Name</th>
                  <th>Type</th>
                  <th>Value</th>
                </tr>
              </thead>

              <tbody>
                {activities.activityList.map((act) => (
                  <tr key={act.activityId}>
                    <td>{act.activityId}</td>
                    <td>{act.activityName}</td>
                    <td>{act.type}</td>
                    <td>{act.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowActivityModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestScriptPage;
