// when user clicks right bottom button
function inject_point_1() {
  console.log("We should pop a login page!");
}

// when bridge starts to build
function inject_point_2() {
  console.log("We start to load something!!!");
}

// when user enter the door
function inject_point_3() {
  console.log("Somebody enter the door!");
  const search = new URL(location.href).searchParams;
  const jump = search.get("jump");
  if (jump) {
    location.href = decodeURIComponent(jump);
  } else {
    history.back();
  }
}
