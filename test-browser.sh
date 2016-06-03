cd test
node compilation-server.js && \
istanbul report && \
open coverage/lcov-report/index.html &
sleep 3
open test-browser.html
wait