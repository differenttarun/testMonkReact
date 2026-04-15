import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

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

  const [originalData, setOriginalData] = useState({
    testScriptName: "",
  });

  const libraryOptions = ["core", "selenium"];

  const functionOptionsMap = {
    core: ["smartcompare", "getExpectedResults"],
    selenium: [
      "launchApplication",
      "getUIValue",
      "enterUIValue",
      "clickButton",
    ],
  };

  const modelOptions = ["SYNE", "FAST"];

  const baseUrl = "http://localhost:5001/api/vi/testscript";

  // =========================
  // SCRIPTS
  // =========================

  const fetchScripts = async () => {
    try {
      const res = await fetch(`${baseUrl}/fetchAllTestScript`);
      if (!res.ok) throw new Error("Failed to fetch scripts");

      const data = await res.json();
      setScripts(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAdd = () => {
    setEditScript(null);
    setFormData({ testScriptName: "" });
    setOriginalData({ testScriptName: "" });
    setShowModal(true);
  };

  const handleEdit = (script) => {
    setEditScript(script);

    const data = {
      testScriptName: script.testScriptName,
    };

    setFormData(data);
    setOriginalData(data);
    setShowModal(true);
  };

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

  const handleDeleteScript = async (id) => {
    try {
      const res = await fetch(`${baseUrl}/delete/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      setScripts((prev) => prev.filter((s) => s.testScriptId !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const isChanged =
    formData.testScriptName !== originalData.testScriptName &&
    formData.testScriptName.trim() !== "";

  // =========================
  // ACTIVITIES
  // =========================

  const fetchActivities = async (scriptId) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/activity/fetchActivityByTestScriptId/${scriptId}`,
      );

      if (!res.ok) throw new Error("Failed to fetch activities");

      const data = await res.json();

      const normalized = (data.activityList || []).map((a, i) => ({
        ...a,
        actOrder: a.actOrder ?? i + 1,
      }));

      setActivities(normalized);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewActivities = async (script) => {
    setSelectedScript(script);
    await fetchActivities(script.testScriptId);
    setShowActivityModal(true);
  };

  // =========================
  // ORDER SORTING
  // =========================

  const sortedActivities = [...activities].sort(
    (a, b) => a.actOrder - b.actOrder,
  );

  // =========================
  // ACTIVITY CHANGE
  // =========================

  const handleActivityChange = (index, field, value) => {
    const updated = [...activities];

    updated[index] = {
      ...updated[index],
      [field]: value,
      isDirty: true,
    };

    if (field === "library") {
      updated[index].function = "";
    }

    setActivities(updated);
  };

  // =========================
  // ADD ACTIVITY
  // =========================

  const handleAddActivity = () => {
    const maxOrder =
      activities.length > 0
        ? Math.max(...activities.map((a) => a.actOrder || 0))
        : 0;

    const newActivity = {
      _id: null,
      activityId: Date.now(),
      testScriptId: selectedScript.testScriptId,
      activityName: "",
      library: "",
      function: "",
      model: "",
      set: "",
      use: "",
      actOrder: maxOrder + 1,
      isNew: true,
      isDirty: true,
    };

    setActivities((prev) => [...prev, newActivity]);
  };

  // =========================
  // DELETE ACTIVITY
  // =========================

  const handleDeleteActivity = async (activity) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/activity/delete/${activity._id}`,
        { method: "DELETE" },
      );

      if (!res.ok) throw new Error("Delete failed");

      const updated = activities
        .filter((a) => a._id !== activity._id)
        .map((a, i) => ({
          ...a,
          actOrder: i + 1,
        }));

      setActivities(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // SAVE ACTIVITY
  // =========================

  const handleUpdateActivity = async (activity) => {
    try {
      const isNew = activity.isNew;

      // =========================
      // 1. VALIDATION
      // =========================
      if (!activity.activityName || !activity.library) {
        alert("Please fill required fields (Name & Library)");
        return;
      }

      // =========================
      // 2. BUILD URL + METHOD
      // =========================
      const url = isNew
        ? "http://localhost:5001/api/vi/activity/create"
        : `http://localhost:5001/api/vi/activity/update/${activity._id}`;

      const method = isNew ? "POST" : "PUT";

      // =========================
      // 3. CLEAN PAYLOAD (IMPORTANT)
      //    - NEVER send isNew/isDirty
      //    - NEVER send null _id on create
      // =========================
      const { isNew: _isNew, isDirty, ...cleanActivity } = activity;

      const payload = {
        ...cleanActivity,
        testScriptId: selectedScript.testScriptId,
      };

      // =========================
      // 4. API CALL
      // =========================
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      const response = await res.json();

      // =========================
      // 5. NORMALIZE RESPONSE
      // =========================
      const saved = response?.activity || response;

      // =========================
      // 6. UPDATE STATE SAFELY
      // =========================
      setActivities((prev) =>
        prev.map((a) => {
          if (a.activityId !== activity.activityId) return a;

          return {
            ...a,
            ...saved,

            // ensure stability
            _id: saved._id || a._id,
            actOrder: saved.actOrder ?? a.actOrder,

            isNew: false,
            isDirty: false,
          };
        }),
      );
    } catch (err) {
      console.error("Activity save failed:", err);
      alert("Failed to save activity");
    }
  };
  // =========================
  // UI
  // =========================

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h3>Test Scripts</h3>
        <Button onClick={handleAdd}>New Test Script</Button>
      </div>

      {/* SCRIPT TABLE */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Created</th>
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
                <Button size="sm" onClick={() => handleEdit(script)}>
                  Edit
                </Button>{" "}
                <Button size="sm" onClick={() => handleViewActivities(script)}>
                  Activities
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteScript(script.testScriptId)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* SCRIPT MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editScript ? "Update Script" : "Add Script"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Control
            name="testScriptName"
            value={formData.testScriptName}
            onChange={handleChange}
          />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowModal(false)}>Close</Button>
          <Button onClick={handleSave} disabled={!isChanged}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ACTIVITY MODAL */}
      <Modal
        show={showActivityModal}
        onHide={() => setShowActivityModal(false)}
        fullscreen
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Activities - {selectedScript?.testScriptName}
          </Modal.Title>

          <Button onClick={handleAddActivity}>New Activity</Button>
        </Modal.Header>

        <Modal.Body>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Seq</th>
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
              {sortedActivities.map((act, index) => (
                <tr key={act.activityId}>
                  {/* ORDER COLUMN */}
                  <td>{act.actOrder}</td>

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
                    <Form.Select
                      value={act.library || ""}
                      onChange={(e) =>
                        handleActivityChange(index, "library", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {libraryOptions.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Select
                      value={act.function || ""}
                      disabled={!act.library}
                      onChange={(e) =>
                        handleActivityChange(index, "function", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {(functionOptionsMap[act.library] || []).map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </Form.Select>
                  </td>

                  <td>
                    <Form.Select
                      value={act.model || ""}
                      onChange={(e) =>
                        handleActivityChange(index, "model", e.target.value)
                      }
                    >
                      <option value="">Select</option>
                      {modelOptions.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </Form.Select>
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

                  <td className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={!act.isDirty && !act.isNew}
                      onClick={() => handleUpdateActivity(act)}
                    >
                      Save
                    </Button>

                    {act.isNew ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setActivities((prev) =>
                            prev.filter((a) => a.activityId !== act.activityId),
                          )
                        }
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteActivity(act)}
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={() => setShowActivityModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestScriptPage;
