import React, { useEffect, useRef, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import Maintask from "./src/Maintask";

const App = () => {

  return (
    <NavigationContainer>
      <Maintask />
    </NavigationContainer>
  );
};

export default App;