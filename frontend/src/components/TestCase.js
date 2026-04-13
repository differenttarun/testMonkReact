import React, { useEffect, useState } from "react";

const TestCase = () => {
  const [testCases, setTestCases] = useState([]);
  const [newTestCase, setNewTestCase] = useState({
    testCaseName: "",
    testScriptId: "",
  });
  const [editTestCase, setEditTestCase] = useState(null);

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

  const handleUpdate = (tc) => {
    setEditTestCase({
      testCaseId: tc.testCaseId,
      testCaseName: tc.testCaseName,
      testScriptId: tc.testScriptId,
    });

    // open modal
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
                <input
                  type="number"
                  className="form-control"
                  name="testScriptId"
                  value={newTestCase.testScriptId}
                  onChange={handleChange}
                />
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

              <div className="mb-3">
                <label className="form-label">Test Script ID</label>
                <input
                  type="number"
                  className="form-control"
                  name="testScriptId"
                  value={editTestCase?.testScriptId || ""}
                  onChange={handleEditChange}
                />
              </div>
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
