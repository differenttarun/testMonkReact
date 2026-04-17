import { useEffect, useState } from "react";
import { Modal, Button, Form, Table } from "react-bootstrap";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash,
  PencilSquare,
  XCircle,
  FloppyFill,
  PlusCircleFill,
} from "react-bootstrap-icons";

const SortableRow = ({ act, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: act.activityId });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <tr ref={setNodeRef} style={style}>
      <td {...attributes} {...listeners} style={{ cursor: "grab" }}>
        ☰
      </td>
      {children}
    </tr>
  );
};

const TestScriptPage = () => {
  const [scripts, setScripts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editScript, setEditScript] = useState(null);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [formData, setFormData] = useState({ testScriptName: "" });
  const [originalData, setOriginalData] = useState({ testScriptName: "" });

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

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    setEditScript(null);
    setFormData({ testScriptName: "" });
    setOriginalData({ testScriptName: "" });
    setShowModal(true);
  };

  const handleEdit = (script) => {
    setEditScript(script);
    const data = { testScriptName: script.testScriptName };
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
        headers: { "Content-Type": "application/json" },
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
      const res = await fetch(`${baseUrl}/delete/${id}`, { method: "DELETE" });
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
      setOriginalOrder(normalized.map((a) => a._id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewActivities = async (script) => {
    setSelectedScript(script);
    await fetchActivities(script.testScriptId);
    setShowActivityModal(true);
  };

  const handleActivityChange = (index, field, value) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], [field]: value, isDirty: true };
    if (field === "library") updated[index].function = "";
    setActivities(updated);
  };

  const handleAddActivity = () => {
    const maxOrder =
      activities.length > 0
        ? Math.max(...activities.map((a) => a.actOrder || 0))
        : 0;

    setActivities((prev) => [
      ...prev,
      {
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
      },
    ]);
  };

  const handleCancelNewActivity = (activityId) => {
    setActivities((prev) =>
      prev
        .filter((a) => a.activityId !== activityId)
        .map((a, i) => ({ ...a, actOrder: i + 1 })),
    );
  };

  const handleDeleteActivity = async (activity) => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/activity/delete/${activity._id}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Delete failed");
      setActivities((prev) =>
        prev
          .filter((a) => a._id !== activity._id)
          .map((a, i) => ({ ...a, actOrder: i + 1 })),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const hasPendingChanges = () => {
    const hasActivityChanges = activities.some((a) => a.isDirty || a.isNew);
    const currentOrder = activities.map((a) => a._id);
    const orderChanged =
      currentOrder.length !== originalOrder.length ||
      currentOrder.some((id, i) => id !== originalOrder[i]);
    return hasActivityChanges || orderChanged;
  };

  const handleSaveAll = async () => {
    try {
      const toSave = activities.filter((a) => a.isDirty || a.isNew);
      const savedActivities = [...activities];

      for (const activity of toSave) {
        if (!activity.activityName || !activity.library) {
          alert(
            "Please fill required fields (Name & Library) for all activities",
          );
          return;
        }

        const isNew = activity.isNew;
        const url = isNew
          ? "http://localhost:5001/api/vi/activity/create"
          : `http://localhost:5001/api/vi/activity/update/${activity._id}`;
        const method = isNew ? "POST" : "PUT";

        const { isNew: _isNew, isDirty, ...cleanActivity } = activity;
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...cleanActivity,
            testScriptId: selectedScript.testScriptId,
          }),
        });

        if (!res.ok) throw new Error("Save failed");
        const response = await res.json();
        const saved = response?.activity || response;

        const idx = savedActivities.findIndex(
          (a) => a.activityId === activity.activityId,
        );
        if (idx !== -1) {
          savedActivities[idx] = {
            ...savedActivities[idx],
            ...saved,
            _id: saved._id || savedActivities[idx]._id,
            actOrder: saved.actOrder ?? savedActivities[idx].actOrder,
            isNew: false,
            isDirty: false,
          };
        }
      }

      const orderRes = await fetch(
        "http://localhost:5001/api/vi/activity/updateOrder",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activities: savedActivities.map((a, i) => ({
              _id: a._id,
              actOrder: i + 1,
            })),
          }),
        },
      );

      if (!orderRes.ok) throw new Error("Order update failed");

      setActivities(savedActivities);
      setOriginalOrder(savedActivities.map((a) => a._id));
      alert("All changes saved successfully");
    } catch (err) {
      console.error("Save all failed:", err);
      alert("Failed to save changes");
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = activities.findIndex((a) => a.activityId === active.id);
    const newIndex = activities.findIndex((a) => a.activityId === over.id);

    setActivities(
      arrayMove(activities, oldIndex, newIndex).map((a, i) => ({
        ...a,
        actOrder: i + 1,
      })),
    );
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="container mt-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between mb-3">
        <h3>Test Scripts</h3>
        <Button onClick={handleAdd}>
          <PlusCircleFill className="me-2" />
          New Test Script
        </Button>
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
              <td className="d-flex gap-2">
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Edit Activity</Tooltip>}
                >
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleEdit(script)}
                  >
                    <PencilSquare className="me-1" />
                  </Button>
                </OverlayTrigger>
                <Button
                  size="sm"
                  variant="info"
                  onClick={() => handleViewActivities(script)}
                >
                  Activities
                </Button>
                <OverlayTrigger
                  placement="top"
                  overlay={<Tooltip>Delete Activity</Tooltip>}
                >
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDeleteActivity(script.testScriptId)}
                  >
                    <Trash />
                  </Button>
                </OverlayTrigger>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <XCircle className="me-1" /> Close
          </Button>
          <Button variant="success" onClick={handleSave} disabled={!isChanged}>
            <FloppyFill className="me-1" /> Save
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
          <div className="d-flex justify-content-between align-items-center w-100 me-2">
            <Modal.Title className="mb-0">
              Activities — {selectedScript?.testScriptName}
            </Modal.Title>
            <div className="d-flex gap-2">
              <Button variant="primary" onClick={handleAddActivity}>
                <PlusCircleFill className="me-1" /> New Activity
              </Button>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Save All</Tooltip>}
              >
                <Button
                  variant="success"
                  onClick={handleSaveAll}
                  disabled={!hasPendingChanges()}
                >
                  <FloppyFill className="me-1" />
                </Button>
              </OverlayTrigger>
            </div>
          </div>
        </Modal.Header>

        <Modal.Body>
          <Table bordered hover>
            <thead>
              <tr>
                <th></th>
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

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activities.map((a) => a.activityId)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {activities
                    .sort((a, b) => a.actOrder - b.actOrder)
                    .map((act, index) => (
                      <SortableRow key={act.activityId} act={act} index={index}>
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
                              handleActivityChange(
                                index,
                                "library",
                                e.target.value,
                              )
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
                              handleActivityChange(
                                index,
                                "function",
                                e.target.value,
                              )
                            }
                          >
                            <option value="">Select</option>
                            {(functionOptionsMap[act.library] || []).map(
                              (f) => (
                                <option key={f}>{f}</option>
                              ),
                            )}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Select
                            value={act.model || ""}
                            onChange={(e) =>
                              handleActivityChange(
                                index,
                                "model",
                                e.target.value,
                              )
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

                        <td>
                          {act.isNew ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Cancel</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  handleCancelNewActivity(act.activityId)
                                }
                              >
                                <XCircle className="me-1" />
                              </Button>
                            </OverlayTrigger>
                          ) : (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>Delete</Tooltip>}
                            >
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteActivity(act)}
                                className="icon-btn"
                              >
                                <Trash />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </td>
                      </SortableRow>
                    ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowActivityModal(false)}
          >
            <XCircle className="me-1" /> Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TestScriptPage;
