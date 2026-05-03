# Frontend Interview Challenge

> [!IMPORTANT]
> You should have received a google doc together with this repository that explains in detail the scope and context of the exercise, together with it's acceptance criteria and any other necessary information for the completion of the challenge.

## Part 1 - Implement a re-usable multi-selection component

Develop a reusable and responsive multi-selection component based on the provided Figma design that can be used within different contexts (you need to log in to be able to view details about the components):

https://www.figma.com/design/WvBKY6iRvC6iVN35VQgNIP/Eversports---Front-End-Task?node-id=1-821

> [!NOTE]
> Since there’s no design system provided for you, feel free to either reach out to any component library that you would like to use to help you with the building blocks for the UI or to implement the components themselves from scratch. The design specs from figma should be respected and match as close as possible independently of which solution you choose.

### 🎯 Acceptance Criteria

- As a user I can search for specific products.
- As a user I can see the list of queried items.
- As a user I can select or deselect all products at once.
- As a user I can select/deselect each product individually.
- As a user I can cancel the selection process and revert any changes by clicking the cancel button or clicking outside of the dropdown.
- As a user I can apply my product selection by clicking the apply button.
- As a user I can use the filter in different types of screen sizes.

## Part 2 - Integrate the component within a page

Build a page that shows a list of purchased products by users leveraging the component from part 1 to allow for the filtering of both products and users. This list should show the purchases that are the result of applying those filters.

The UI below is just a representation of how we expect the page to look, but feel free to customize it however you feel best, the important part is to see the component you developed from before in action within the context of a general web application.

In the page the user can interact with both a product and a user filter and see the filtered data when the filters are applied.

The dataset available has 300 products, 100 users and 150 purchases, all of them randomly generated using https://fakerjs.dev . This lists can be paginated. 

<p align="center">
    <img width="599" alt="image" src="https://github.com/user-attachments/assets/dd806009-ab87-494a-bdd4-d3f31c814047">
</p>

### 🎯 Acceptance Criteria

- As a user I can see the available products, users and purchases.
- As a user I can filter purchases by specific products and/or users.
- As a user I can see the results of my selection.
- As a user I can clear the filter selection.
- As a user I can use the filters in different types of screen sizes.

## Repository Intro

The repository is structured as a monorepo. To get started install all dependencies in the root folder.

```sh
npm install
```

In this repository you can find 2 folders:

- `graphql-server` - A simple graphql mocked server with a single product query that should be used for the assignment. You are not expected to change anything in this folder or in the implementation of the resolver.

  ### Usage

  ```sh
  npm run dev:server
  ```

  This will start a graphql-server at http://localhost:4000/. You should be able to see the following:

    <img width="1796" alt="image" src="https://github.com/eversport/frontend-interview/assets/3718438/d0ead1b8-da66-4925-9d9f-cc6cc2de1863">

  When clicking `"Query your server"`, you should be able to see the graphql sandbox explorer where you can explore both the query and the data for the products/users/purchases resolver in order to get more comfortable with the schema. In the left sidebart you see an overview of all different available queries.

    <img width="1800" alt="image" src="https://github.com/eversport/frontend-interview/assets/3718438/4e23ca49-d075-47bc-ba8b-71559a18c68d">

  Here is an example of a query you could use to fetch products:

  ```graphql
  query ExampleQuery($first: Int, $after: String, $searchTerm: String) {
    products(first: $first, after: $after, searchTerm: $searchTerm) {
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
      nodes {
        id
        name
      }
    }
  }
  ```

- `next-boilerplate-client` - A bootstrapped NextJs application with a basic typescript + tailwind configuration with a simple apollo graphql config to fetch data from `graphql-server`. It contains at the root route, an example of the fetching of the products query and it's usage. Feel free to edit anything you want, to add or remove files, to use an alternative styling solution or even setup the graphql integration differently.

  ### Usage

  ```sh
  npm run dev:client
  ```

  This will start a NextJs app at http://localhost:3000/. In it you will find a simple example of a client component that fetches data and displays the first 10 products.

    <img width="1800" alt="image" src="https://github.com/eversport/frontend-interview/assets/3718438/b62acbe8-1e39-4eac-a99e-7bcc8c6a5ed4">

## 🗒️ Conditions

- You will have multiple days for the challenge, but most of our candidates spend around **8h to 10h** on this assignment.
- You should put your code in GitHub or GitLab/Bitbucket and send us the link to your repository where we can find the source code. That means no ZIP files.
- Please make sure to include any additional instructions in a README in case you change something about the compilation or execution of the codebase.

## 💻 Technologies

We believe that great developers are not bound to a specific technology set, but no matter their toolbox they are able to think critically about how to structure and design good code, but because we would like you to work in our current modern stack we would like for this challenge to be as close as possible to the normal everyday stack you would work with. For that reason the challenge should be completed with:

#### Required

- React - https://reactjs.org/

#### Optional

- TypeScript - https://www.typescriptlang.org/
- Tailwind - https://tailwindcss.com/
- NextJs - https://nextjs.org/

### Other Resources

- Apollo Documentation - https://www.apollographql.com/docs/
- Shadcn/ui - https://ui.shadcn.com/
- Radix - https://www.radix-ui.com/
- Relay graphql cursor specs - https://relay.dev/graphql/connections.htm

## 🤖 Use of AI Tools

At Eversports, we actively use AI as a supporting tool in our daily work, and we welcome candidates who can use it effectively and responsibly. You are free to use AI tools (such as ChatGPT, GitHub Copilot, Claude Code, or others) while completing this assignment. To help us understand your individual contribution and reasoning, **please add an AI-SUPPORT.md file** and describe in there where and how you used AI assistance.

Example AI-SUPPORT.md format:
```
- Used Claude Code to generate the initial code structure.
- Asked GitHub Copilot for suggestions on unit test setup.
- Used ChatGPT to rephrase parts of this README for clarity.
```

It’s important to note that there are **no penalties for using AI**. Our goal is simply to understand which parts reflect your own problem-solving and which were supported by tools.

---

Best of luck and looking forward to what you are able to accomplish! 🙂
