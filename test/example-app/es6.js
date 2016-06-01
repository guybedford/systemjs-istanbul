export async function a() {
  await new Promise((resolve, reject) => setTimeout(resolve, 10));
  var p = 5;
  if (p == 5) {
    // just to pad out the coverage
    p = 10;
  }
  else {
    // to check coverage gaps in branches
    c();
    console.log('hello world');
    p = 5;
  }
  return 'first function';
}

function c() {
  return 'asdf';
}

export function b() {
  return 'second function';
}