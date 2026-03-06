This document provides instructions on how to set up and run the project locally.

### Prerequisites

- Node.js (v18 or higher)
- npm

### Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Joshua-Onyekachukwu/TaxWise.git
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following variables:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
    NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.
