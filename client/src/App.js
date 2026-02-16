import UserContext from "./components/AccountContext";
import Views from "./components/Views";
import socket from "./socket";
function App() {
  socket.connect();
  return (
    <>
      <UserContext>
        <Views />
      </UserContext>
    </>
  );
}

export default App;
