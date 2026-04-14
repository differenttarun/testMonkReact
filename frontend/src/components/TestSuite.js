import React, { useEffect, useState } from "react";

const TestSuiteList = () => {
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [suiteName, setSuiteName] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // ✅ New state for adding test case
  const [newTestCaseId, setNewTestCaseId] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [env, setEnv] = useState("QA");

  const [newSuiteName, setNewSuiteName] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [editSuite, setEditSuite] = useState(null);

  // Fetch all test suites
  useEffect(() => {
    const fetchTestSuites = async () => {
      try {
        const res = await fetch(
          "http://localhost:5001/api/vi/testSuite/fetchAllSuites",
        );
        const data = await res.json();
        setTestSuites(data);
      } catch (err) {
        setError("Failed to fetch test suites");
      } finally {
        setLoading(false);
      }
    };

    fetchTestSuites();
  }, []);

  const fetchTestSuites = async () => {
    try {
      const res = await fetch(
        "http://localhost:5001/api/vi/testSuite/fetchAllSuites",
      );
      const data = await res.json();
      setTestSuites(data);
    } catch (err) {
      setError("Failed to fetch test suites");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSuiteUpdate = async () => {
    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testSuite/${editSuite.testSuiteId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testSuiteName: editSuite.testSuiteName,
          }),
        },
      );

      if (!res.ok) throw new Error("Update failed");

      // close modal
      document.getElementById("closeSuiteModalBtn").click();

      // refresh list
      await fetchTestSuites();
    } catch (err) {
      console.error("Error updating suite:", err);
    }
  };

  const handleSuiteChange = (e) => {
    const { name, value } = e.target;

    setEditSuite({
      ...editSuite,
      [name]: value,
    });
  };

  const handleUpdateSuite = (suite) => {
    setEditSuite({
      testSuiteId: suite.testSuiteId,
      testSuiteName: suite.testSuiteName,
    });

    // open modal
    const modal = new window.bootstrap.Modal(
      document.getElementById("updateSuiteModal"),
    );
    modal.show();
  };

  const handleCreateSuite = async () => {
    if (!newSuiteName.trim()) {
      setCreateStatus("Please enter test suite name");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/vi/testSuite/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          testSuiteName: newSuiteName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create");
      }

      setCreateStatus("✅ Created successfully");

      // ✅ Add to UI instantly
      setTestSuites((prev) => [
        ...prev,
        { testSuiteId: data.testSuiteId, testSuiteName: newSuiteName },
      ]);

      setNewSuiteName("");
      // ✅ CLOSE MODAL
      const modalElement = document.getElementById("createSuiteModal");
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);

      modalInstance.hide();
    } catch (err) {
      setCreateStatus("❌ " + err.message);
    }
  };

  const handleDeleteMapping = async (testCaseId, env) => {
    const confirmDelete = window.confirm(
      `Delete Test Case ${testCaseId} from ${env}?`,
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        "http://localhost:5001/api/vi/testSuiteTestCaseMapping/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testSuiteId: Number(selectedSuiteId),
            testCaseId: Number(testCaseId),
            env: env,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      // ✅ Remove from UI instantly
      setTestCases((prev) =>
        prev.filter((tc) => !(tc.testCaseId === testCaseId && tc.env === env)),
      );
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // Fetch test cases
  const handleView = async (suiteId) => {
    setSelectedSuiteId(suiteId);
    setLoadingCases(true);
    setAddStatus("");

    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testSuite/fetchTestCasesBySuiteId/${suiteId}`,
      );
      const data = await res.json();

      setSuiteName(data.testSuiteName);
      setTestCases(data.testCaseList || []);
    } catch {
      setTestCases([]);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleDeleteSuite = async (testSuiteId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this test suite?",
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `http://localhost:5001/api/vi/testSuite/delete/${testSuiteId}`,
        {
          method: "DELETE",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Delete Error:", data);
        throw new Error(data.message || "Failed to delete");
      }

      console.log("Deleted:", data);

      // ✅ Remove from UI without reload
      setTestSuites((prev) =>
        prev.filter((suite) => suite.testSuiteId !== testSuiteId),
      );
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  };

  // ✅ Add test case API call
  const handleAddTestCase = async () => {
    if (!newTestCaseId || !env) {
      setAddStatus("Please enter Test Case ID and select environment");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5001/api/vi/testSuiteTestCaseMapping/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testCaseId: Number(newTestCaseId),
            testSuiteId: Number(selectedSuiteId),
            env: env,
          }),
        },
      );

      const data = await res.json(); // ✅ read response body

      if (!res.ok) {
        // ✅ Show backend error message
        console.error("API Error:", data);
        throw new Error(data.message || "Failed to add test case");
      }

      console.log("Success:", data);

      setAddStatus(`✅ Added to ${env} environment`);
      setNewTestCaseId("");

      // refresh
      handleView(selectedSuiteId);
    } catch (err) {
      console.error("Catch Error:", err);
      setAddStatus(`❌ ${err.message}`);
    }
  };

  if (loading) return <div className="text-center mt-3">Loading...</div>;
  if (error) return <div className="text-danger text-center mt-3">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="row my-1">
        <div className="col-10">
          <h3>Test Suites</h3>
        </div>
        <div className="col-2">
          <button
            style={{ float: "right" }} // ✅ FIX
            className="btn btn-primary"
            data-bs-toggle="modal"
            data-bs-target="#createSuiteModal"
          >
            New Suite
          </button>
        </div>
      </div>
      <ul className="list-group mt-3">
        {/* Header Row */}
        <li className="list-group-item d-flex justify-content-between align-items-center bg-white text-black fw-bold">
          <div className="me-3">
            <span>Test Suite</span>
          </div>

          <div className="d-flex gap-3">
            <span>Actions</span>
          </div>
        </li>

        {/* Data Rows */}
        {testSuites.map((suite) => (
          <li
            key={suite._id || suite.testSuiteId}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="me-3">
              <h5 className="mb-0">
                {suite.testSuiteId + " : " + suite.testSuiteName}
              </h5>

              <small className="text-muted">
                Created:{" "}
                {suite.createdDate
                  ? new Date(suite.createdDate).toLocaleDateString()
                  : "N/A"}
              </small>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary btn-sm"
                data-bs-toggle="modal"
                data-bs-target="#testCaseModal"
                onClick={() => handleView(suite.testSuiteId)}
              >
                Test Case List
              </button>

              <button
                className="btn btn-sm btn-warning"
                onClick={() => handleUpdateSuite(suite)}
              >
                Update
              </button>

              <button
                className="btn btn-sm btn-danger"
                onClick={() => handleDeleteSuite(suite.testSuiteId)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* /* */}
      <div className="modal fade" id="createSuiteModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">Create Test Suite</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            {/* Body */}
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                placeholder="Enter Test Suite Name"
                value={newSuiteName}
                onChange={(e) => setNewSuiteName(e.target.value)}
              />

              {createStatus && (
                <small className="mt-2 d-block">{createStatus}</small>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>

              <button className="btn btn-primary" onClick={handleCreateSuite}>
                Create
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Modal */}
      <div className="modal fade" id="testCaseModal">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Test Cases - {suiteName}</h5>
              <button className="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div className="modal-body">
              {/* ✅ Add Test Case Section */}
              <div className="mb-3 border p-3 rounded">
                <h6>Add Test Case</h6>

                <div className="row g-2">
                  {/* Test Case ID */}
                  <div className="col-md-4">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Test Case ID"
                      value={newTestCaseId}
                      onChange={(e) => setNewTestCaseId(e.target.value)}
                    />
                  </div>

                  {/* Environment Dropdown */}
                  <div className="col-md-4">
                    <select
                      className="form-select"
                      value={env}
                      onChange={(e) => setEnv(e.target.value)}
                    >
                      <option value="QA">QA</option>
                      <option value="DEV">DEV</option>
                      <option value="UAT">UAT</option>
                      <option value="PROD">PROD</option>
                    </select>
                  </div>

                  {/* Add Button */}
                  <div className="col-md-4 d-grid">
                    <button
                      className="btn btn-success"
                      onClick={handleAddTestCase}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {addStatus && (
                  <small className="mt-2 d-block">{addStatus}</small>
                )}
              </div>

              {/* ✅ Test Case List */}
              {loadingCases ? (
                <div className="text-center">
                  <div className="spinner-border"></div>
                </div>
              ) : testCases.length === 0 ? (
                <p>No test cases found</p>
              ) : (
                <ul className="list-group">
                  {testCases.map((tc) => (
                    <li key={tc._id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6>{"TestCaseID: " + tc.testCaseId}</h6>
                          <h6>{"TestCase Name: " + tc.testCaseName}</h6>

                          <small>{"ENV : " + tc.env + " "}</small>
                          <small>
                            {"Created Date : " +
                              new Date(tc.createdDate).toLocaleString()}
                          </small>
                        </div>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() =>
                            handleDeleteMapping(tc.testCaseId, tc.env)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="updateSuiteModal"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Update Test Suite</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Test Suite Name</label>
                <input
                  type="text"
                  className="form-control"
                  name="testSuiteName"
                  value={editSuite?.testSuiteName || ""}
                  onChange={handleSuiteChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                id="closeSuiteModalBtn"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveSuiteUpdate}
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

export default TestSuiteList;
