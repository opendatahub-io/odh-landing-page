import React from 'react';
import { Stack, StackItem } from '@patternfly/react-core';
import {
  InferenceMetricType,
  ModelServingMetricsContext,
} from '~/pages/modelServing/screens/metrics/ModelServingMetricsContext';
import MetricsChart from '~/pages/modelServing/screens/metrics/MetricsChart';

const DirGraph = () => {
  const { data } = React.useContext(ModelServingMetricsContext);
  const metric = {
    ...data[InferenceMetricType.TRUSTY_AI_DIR],
    data: data[InferenceMetricType.TRUSTY_AI_DIR].data[0]?.values, //map((x) => x?.[0]?.values || []),
  };

  const metric2 = {
    ...data[InferenceMetricType.TRUSTY_AI_DIR],
    data: data[InferenceMetricType.TRUSTY_AI_DIR].data[1]?.values, //map((x) => x?.[0]?.values || []),
  };

  // eslint-disable-next-line no-console
  console.log('DIR Full payload: %O', data[InferenceMetricType.TRUSTY_AI_DIR]);

  return (
    <MetricsChart
      metrics={{
        name: 'DIR',
        metric,
      }}
      threshold={1.2}
      minThreshold={0.8}
      thresholdColor="red"
      title="Disparate Impact Ratio (DIR)"
      domainCalc={(maxYValue) => ({
        y:
          Math.abs(maxYValue - 1) > 0.2
            ? [1 - Math.abs(maxYValue - 1) - 0.1, 1 + Math.abs(maxYValue - 1) + 0.1]
            : [0.7, 1.3],
      })}
    />
  );
};

export default DirGraph;
