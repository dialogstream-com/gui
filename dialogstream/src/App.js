import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import FlowEdit from "./components/FlowEditor2";

class App extends Component {
  render() {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <img
                        src="/dialogstream-animation.svg"
                        alt="DialogStream Logo"
                        className="h-8 w-8"
                    />
                    <h1 className="text-xl font-semibold">Flow Editor</h1>
                </div>
            </div>
            <FlowEdit />
        </div>
    );
  }
}

export default App;
