const TestSuiteState = (props) => {
  const state = {
    id: "testSuiteID",
    testSuiteName: "dummy Suite",
  };
  return (
    <TestSuiteState.provider value={state}>
      {props.children}
    </TestSuiteState.provider>
  );
};

export default testSuiteState;
