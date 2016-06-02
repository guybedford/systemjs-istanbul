cd test
node compilation-server.js && \
istanbul report && \
open coverage/lcov-report/index.html &
sleep 1
open test-browser.html
wait