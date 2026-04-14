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
      setActivities(data.activityList || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (_id) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/activity/delete/${_id}`,
        {
          method: "DELETE",
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      // remove from UI
      setActivities((prev) => prev.filter((a) => a._id !== _id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateActivity = async (activity) => {
    try {
      const isNew = activity.isNew;

      const url = isNew
        ? "http://localhost:5001/api/vi/activity/create"
        : `http://localhost:5001/api/vi/activity/update/${activity.activityId}`;

      const method = isNew ? "POST" : "PUT";

      const { _id, isNew: _, isDirty, ...cleanActivity } = activity;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...cleanActivity,
          testScriptId: selectedScript.testScriptId,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      // ✅ Reset dirty flag locally
      setActivities((prev) =>
        prev.map((a) =>
          a.activityId === activity.activityId
            ? { ...a, isDirty: false, isNew: false }
            : a,
        ),
      );

      alert(isNew ? "Created successfully" : "Updated successfully");
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

  const handleAddActivity = () => {
    // get max activityId from existing list
    const maxId =
      activities && activities.length > 0
        ? Math.max(...activities.map((a) => Number(a.activityId) || 0))
        : 0;

    const newActivity = {
      activityId: maxId + 1, // ✅ next ID
      testScriptId: selectedScript.testScriptId,
      activityName: "",
      library: "",
      function: "",
      model: "",
      set: "",
      use: "",
      isNew: true,
    };

    setActivities((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      newActivity,
    ]);
  };

  const handleActivityChange = (index, field, value) => {
    const updated = [...activities];

    updated[index][field] = value;
    updated[index].isDirty = true; // ✅ mark as modified

    setActivities(updated);
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
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Activities - {selectedScript?.testScriptName}
          </Modal.Title>

          <Button
            variant="primary"
            size="sm"
            className="ms-3"
            onClick={handleAddActivity}
          >
            + Add Activity
          </Button>
        </Modal.Header>

        <Modal.Body>
          {activities.length === 0 ? (
            <p>No activities found</p>
          ) : (
            <Table bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Library</th>
                  <th>Function</th>
                  <th>Model</th>
                  <th>Set</th>
                  <th>Use</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {activities.map((act, index) => (
                  <tr key={act.activityId}>
                    <td>{act.activityId}</td>

                    <td>
                      <Form.Control
                        value={act.activityName}
                        onChange={(e) =>
                          handleActivityChange(
                            index,
                            "activityName",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={act.library}
                        onChange={(e) =>
                          handleActivityChange(index, "library", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={act.function}
                        onChange={(e) =>
                          handleActivityChange(
                            index,
                            "function",
                            e.target.value,
                          )
                        }
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={act.model}
                        onChange={(e) =>
                          handleActivityChange(index, "model", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={act.set}
                        onChange={(e) =>
                          handleActivityChange(index, "set", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <Form.Control
                        value={act.use}
                        onChange={(e) =>
                          handleActivityChange(index, "use", e.target.value)
                        }
                      />
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        disabled={!act.isDirty && !act.isNew} // ✅ key logic
                        onClick={() => handleUpdateActivity(act)}
                      >
                        {act.isNew ? "Create" : "Save"}
                      </Button>

                      {act.isNew && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="me-2"
                          onClick={() =>
                            setActivities((prev) =>
                              prev.filter(
                                (a) => a.activityId !== act.activityId,
                              ),
                            )
                          }
                        >
                          Cancel
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteActivity(act._id)}
                      >
                        Delete
                      </Button>
                    </td>
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
