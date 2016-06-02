cd test && \
node generate-node-coverage.js && \
istanbul report && \
open coverage/lcov-report/index.html