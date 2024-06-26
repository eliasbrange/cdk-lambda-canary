const url = process.argv.slice(2)[0];

if (!url) {
  console.error("Error: missing URL argument");
  process.exit(1);
}

let i = 0;

while (true) {
  const response = await fetch(url);
  const json = await response.json();
  console.log(i, response.status, json);
  i++;
  await new Promise((resolve) => setTimeout(resolve, 200));
}
