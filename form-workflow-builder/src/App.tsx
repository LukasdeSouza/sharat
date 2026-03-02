import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import FormBuilder from './pages/FormBuilder';
import WorkflowDesigner from './pages/WorkflowDesigner';
import FormPreview from './pages/FormPreview';
import Submissions from './pages/Submissions';
import Users from './pages/Users';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import PublicForm from './pages/PublicForm';
import FormList from './pages/FormList';
import WorkflowList from './pages/WorkflowList';
import MyTasks from './pages/MyTasks';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/f/:id" element={<PublicForm />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="forms" element={<FormList />} />
          <Route path="forms/builder" element={<FormBuilder />} />
          <Route path="workflows" element={<WorkflowList />} />
          <Route path="workflows/designer" element={<WorkflowDesigner />} />
          <Route path="preview/:formId" element={<FormPreview />} />
          <Route path="submissions" element={<Submissions />} />
          <Route path="users" element={<Users />} />
          <Route path="my-tasks" element={<MyTasks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
