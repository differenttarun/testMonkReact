import React, { useEffect, useState } from "react";

const TestCase = () => {
  const [testCases, setTestCases] = useState([]);
  const [testScripts, setTestScripts] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState("");

  const [newTestCase, setNewTestCase] = useState({
    testCaseName: "",
    testScriptId: "",
  });
  const [editTestCase, setEditTestCase] = useState(null);

  const [testDataList, setTestDataList] = useState([]);
  const [newTestData, setNewTestData] = useState({
    env: "",
    key: "",
    value: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTestCase({
      ...newTestCase,
      [name]: value,
    });
  };

  const handleAddTestCase = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/vi/testCase/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testCaseName: newTestCase.testCaseName,
          testScriptId: Number(newTestCase.testScriptId),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create test case");
      }

      const data = await res.json();
      console.log("Created:", data);

      setNewTestCase({
        testCaseName: "",
        testScriptId: "",
      });
      document.getElementById("closeModalBtn").click();
      fetchTestCases();
    } catch (err) {
      console.error("Error adding test case:", err);
      alert("Failed to add test case");
    }
  };

  // Fetch test cases
  const fetchTestCases = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testCase/fetchAllTestCase`,
      );
      const data = await res.json();
      setTestCases(data);
    } catch (err) {
      console.error("Error fetching test cases", err);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, []);

  // Delete Test Case
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this test case?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testCase/delete/${id}`,
        { method: "DELETE" },
      );

      const data = await res.json();
      fetchTestCases(); // refresh list
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditTestCase({
      ...editTestCase,
      [name]: value,
    });
  };

  const fetchTestScripts = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/vi/testScript/fetchAllTestScript",
      );
      const data = await res.json();
      setTestScripts(data);
    } catch (err) {
      console.error("Error fetching test scripts", err);
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testCase/${editTestCase.testCaseId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testCaseName: editTestCase.testCaseName,
            testScriptId: Number(editTestCase.testScriptId),
          }),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      // close modal
      document.getElementById("closeUpdateModalBtn").click();

      // refresh list
      fetchTestCases();
    } catch (err) {
      console.error("Error updating:", err);
    }
  };

  const handleAddTestData = async () => {
    if (!selectedEnv) {
      alert("Please select environment first");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/vi/testData/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testCaseId: editTestCase.testCaseId,
          env: selectedEnv, // 🔥 from dropdown
          key: newTestData.key,
          value: newTestData.value,
        }),
      });

      if (!res.ok) throw new Error("Failed to add");

      setNewTestData({ key: "", value: "" });

      fetchTestData(editTestCase.testCaseId, selectedEnv);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (editTestCase?.testCaseId && selectedEnv) {
      fetchTestData(editTestCase.testCaseId, selectedEnv);
    }
  }, [selectedEnv, editTestCase]);

  const fetchTestData = async (testCaseId, env) => {
    if (!env) return; // ❌ do nothing if env not selected

    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testData/fetchTestDataByTestCaseIDAndEnv/${testCaseId}/${env}`,
      );
      const data = await res.json();
      setTestDataList(data);
    } catch (err) {
      console.error("Error fetching test data", err);
    }
  };

  const handleDeleteTestData = async (id) => {
    if (!window.confirm("Delete this test data?")) return;

    try {
      await fetch(`http://localhost:5001/api/vi/testData/delete/${id}`, {
        method: "DELETE",
      });

      fetchTestData(editTestCase.testCaseId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (tc) => {
    setEditTestCase({
      testCaseId: tc.testCaseId,
      testCaseName: tc.testCaseName,
      testScriptId: tc.testScriptId,
    });

    setSelectedEnv(""); // 🔥 reset env
    setTestDataList([]); // 🔥 clear old data

    const modal = new window.bootstrap.Modal(
      document.getElementById("updateTestCaseModal"),
    );
    modal.show();
  };

  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between align-items-center">
        <h4>Test Cases</h4>

        <button
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addTestCaseModal"
          onClick={fetchTestScripts}
        >
          New Test Case
        </button>
      </div>

      <table className="table table-bordered table-hover mt-3">
        <thead className="table">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>
              <div style={{ float: "right" }}>Actions</div>
            </th>
          </tr>
        </thead>

        <tbody>
          {testCases.length > 0 ? (
            testCases.map((tc) => (
              <tr key={tc.testCaseId}>
                <td>{tc.testCaseId}</td>
                <td>{tc.testCaseName}</td>

                <td style={{ float: "right" }}>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleUpdate(tc)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(tc.testCaseId)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No Test Cases Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div
        className="modal fade"
        id="addTestCaseModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Test Case</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Test Case Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="testCaseName"
                  value={newTestCase.testCaseName}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Test Script ID</label>
                <select
                  className="form-select"
                  name="testScriptId"
                  value={newTestCase.testScriptId}
                  onChange={handleChange}
                >
                  <option value="">Select Test Script</option>

                  {testScripts.map((ts) => (
                    <option key={ts.testScriptId} value={ts.testScriptId}>
                      {ts.testScriptId} - {ts.testScriptName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                id="closeModalBtn"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddTestCase}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="updateTestCaseModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Test Case</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              {/* Test Case Fields */}
              <div className="mb-3">
                <label className="form-label">Test Case Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="testCaseName"
                  value={editTestCase?.testCaseName || ""}
                  onChange={handleEditChange}
                />
              </div>

              {/* ---------------- TEST DATA SECTION ---------------- */}
              <hr />
              <hr />
              <h6>Test Data</h6>

              {/* ENV SELECT */}
              <div className="mb-3">
                <label className="form-label">Environment</label>
                <select
                  className="form-select"
                  value={selectedEnv}
                  onChange={(e) => setSelectedEnv(e.target.value)}
                >
                  <option value="">Select Environment</option>
                  <option value="QA">QA</option>
                  <option value="DEV">DEV</option>
                  <option value="UAT">UAT</option>
                  <option value="PROD">PROD</option>
                </select>
              </div>

              {/* Add Row - only show if env selected */}
              {selectedEnv && (
                <div className="row mb-2">
                  <div className="col">
                    <input
                      className="form-control"
                      placeholder="Key"
                      value={newTestData.key}
                      onChange={(e) =>
                        setNewTestData({ ...newTestData, key: e.target.value })
                      }
                    />
                  </div>

                  <div className="col">
                    <input
                      className="form-control"
                      placeholder="Value"
                      value={newTestData.value}
                      onChange={(e) =>
                        setNewTestData({
                          ...newTestData,
                          value: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="col-auto">
                    <button
                      className="btn btn-success"
                      onClick={handleAddTestData}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <table className="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th>Env</th>
                    <th>Key</th>
                    <th>Value</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {!selectedEnv ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        Select environment to view test data
                      </td>
                    </tr>
                  ) : testDataList.length > 0 ? (
                    testDataList.map((td) => (
                      <tr key={td.testDataId}>
                        <td>{td.env}</td>
                        <td>{td.key}</td>
                        <td>{td.value}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTestData(td.testDataId)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center">
                        No Test Data Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Table */}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                id="closeUpdateModalBtn"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveUpdate}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestCase;
