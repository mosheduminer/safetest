import React from 'react';
import { type Suite as SuiteType } from './file';
import { ComponentsContext, StateContext } from './report';
import { type Test as TestType } from './file';

export type Status = TestType['status'];
type Statuses = Partial<Record<Status, number>>;

export const SuiteStatuses: React.FunctionComponent<{ suite: SuiteType }> = ({
  suite,
}) => {
  const { Chip } = React.useContext(ComponentsContext);
  const statuses = getStatusesCount(suite);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center' }}>
      {getStatusesText(statuses).map((label) => (
        <Chip key={label} label={label} />
      ))}
    </div>
  );
};
const getStatusesText = (statuses: Statuses) =>
  Object.entries(statuses).map(([status, count]) => {
    return `${count > 1 ? `${count}x ` : ''}${statusMap[status as Status]}`;
  });
const getTestStatuses = (tests: TestType[], statuses: Statuses = {}) => {
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  return getStatusesText(statuses);
};
const getStatusesCount = (suite: SuiteType, statuses: Statuses = {}) => {
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  for (const test of tests) {
    const status = test.status;
    statuses[status] = (statuses[status] || 0) + 1;
  }
  for (const suite of suites) {
    getStatusesCount(suite, statuses);
  }
  return statuses;
};

export const statusMap = {
  passed: '✅',
  failed: '❌',
  pending: '⏱',
  skipped: '⏭',
  todo: '📝',
  disabled: '🚫',
  empty: '📭',
};

const showSuite = (suite: SuiteType, showing?: string) => {
  const counts = getStatusesCount(suite);
  if (showing !== 'all' && !counts[showing as 'passed']) {
    return false;
  }
  return true;
};

export const Suite: React.FunctionComponent<
  React.PropsWithChildren<{ suite: SuiteType }>
> = ({ suite }) => {
  const { Accordion, Label, Test } = React.useContext(ComponentsContext);
  const suites = Object.values(suite.suites);
  const tests = Object.values(suite.tests);
  const showing = React.useContext(StateContext).viewing;
  if (!showSuite(suite, showing)) return null;

  return (
    <>
      {suites
        .filter((subSuite) => showSuite(subSuite, showing))
        .map((subSuite) => (
          <Accordion
            defaultOpen
            key={subSuite.name}
            summary={
              <>
                <Label>Suite</Label> <SuiteStatuses suite={subSuite} />
                {subSuite.name}
              </>
            }
          >
            <Suite key={subSuite.id} suite={subSuite} />
          </Accordion>
        ))}
      {tests.length > 0 && (
        <Accordion
          defaultOpen
          summary={<Label>{getTestStatuses(tests)} Tests</Label>}
        >
          {tests
            .filter((t) => (showing === 'all' ? true : t.status === showing))
            .map((test) => (
              <Test key={test.id} test={test} />
            ))}
        </Accordion>
      )}
    </>
  );
};
