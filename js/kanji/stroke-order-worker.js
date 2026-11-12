import {analyzeStrokeOrder} from './stroke-order.js';
onmessage = ({data}) => {
  try {
    postMessage({id: data.id, assessment: analyzeStrokeOrder(data.userStrokes, data.referenceStrokes, data.context)});
  } catch {
    postMessage({id: data.id, assessment: {status: 'unable', reason: 'computation-error', issues: []}});
  }
};
