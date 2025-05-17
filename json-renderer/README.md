# Best way to render markdown in react

Create a folder in your `src` or `components` folder named `printJson` and create 2 files
- `printJson.jsx` - This file does the rendering
- `printJson.css` - Adjustable custom styling for the rendered JSON

Copy to `printJson.json`:
```jsx
import "./printJson.css";

export function printJson(json) {
  if (!json) return ""; //no JSON from response

  json = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return json.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    function (match) {
      var cls = "number";
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = "key";
        } else {
          cls = "string";
        }
      } else if (/true|false/.test(match)) {
        cls = "boolean";
      } else if (/null/.test(match)) {
        cls = "null";
      }
      return '<span class="' + cls + '">' + match + "</span>";
    }
  );
}
```

Copy to `printJson.css`:
**Note**: This file can be edited to suit your app theme
```css
pre {
  outline: 1px solid #ccc;
  padding: 5px;
  margin: 15px;
}
.string {
  color: green;
}
.number {
  color: darkorange;
}
.boolean {
  color: blue;
}
.null {
  color: magenta;
}
.key {
  color: red;
}

```
In your `App.jsx` or any file where you will be rendering the json content, use the line below to call the printJson function. Don't forget to import.
```jsx
const formattedJson = printJson(JSON.stringify(data5, null, 2));
```

In the return block, render the formatted `json` safely.
```jsx
<pre dangerouslySetInnerHTML={{ __html: formattedJson }} />
```

## Some Test Data
Test Data 1
```json
{
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    isActive: true,
    hobbies: ["Reading", "Gaming", "Hiking"],
};
```

Test Data 2
```json
{
    id: 1,
    name: "Ada Lovelace",
    email: "ada@computing.com",
    verified: true,
    created_at: "2023-01-12T10:45:00Z",
};
```

Test Data 3
```json
{
    category: "Electronics",
    products: [
      {
        id: "P1001",
        name: "Smartphone",
        price: 699.99,
        in_stock: true,
      },
      {
        id: "P1002",
        name: "Bluetooth Speaker",
        price: 49.95,
        in_stock: false,
      },
    ],
};
```

Test Data 4
```json
{
    post_id: 202,
    title: "Understanding React Hooks",
    author: {
      name: "John Doe",
      user_id: 57,
    },
    published: true,
    tags: ["react", "javascript", "hooks"],
    comments: [
      {
        comment_id: 1,
        text: "Great article!",
        user: "alice",
      },
      {
        comment_id: 2,
        text: "Helped me a lot, thanks!",
        user: "bob",
      },
    ],
};
```

Test Data 5
```json
{
    order_id: "ORD123456",
    status: "shipped",
    total: 150.75,
    items: [
      { sku: "A1", name: "Notebook", quantity: 2 },
      { sku: "B2", name: "Pen Set", quantity: 1 },
    ],
    shipping_address: {
      name: "Jane Smith",
      street: "123 Main St",
      city: "Lagos",
      zip: "100001",
      country: "Nigeria",
    },
};
```

Test Data 6
```json
{
    location: "Nairobi",
    temperature: {
      current: 24.5,
      high: 28,
      low: 18,
    },
    forecast: [
      { day: "Monday", condition: "Sunny", high: 30, low: 20 },
      { day: "Tuesday", condition: "Cloudy", high: 25, low: 19 },
    ],
    alerts: null,
};
```
