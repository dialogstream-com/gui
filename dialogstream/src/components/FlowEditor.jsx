import React, { useState, useRef } from 'react';
import {
    PlusIcon as Plus,
    Trash2Icon as Trash2,
    SaveIcon as Save,
    Edit2Icon as Edit2,
    DownloadIcon as Download,
    UploadIcon as Upload,
    GripVerticalIcon as GripVertical
} from 'lucide-react';


const FlowEditor = () => {
    const [flows, setFlows] = useState([
        {
            id: 1,
            name: "RTSP z detekcją ruchu i zapisaniem obrazów",
            steps: [
                "rtsp://test1234:test1234@192.168.188.225:554/Preview_01_sub",
                "file:///motion"
            ]
        }
    ]);

    const [editingFlow, setEditingFlow] = useState(null);
    const [newFlowName, setNewFlowName] = useState('');
    const [newStep, setNewStep] = useState('');
    const [editingStep, setEditingStep] = useState({ index: -1, value: '' });
    const [draggedStep, setDraggedStep] = useState(null);
    const fileInputRef = useRef();

    const addFlow = () => {
        if (newFlowName.trim()) {
            setFlows([...flows, {
                id: Date.now(),
                name: newFlowName,
                steps: []
            }]);
            setNewFlowName('');
        }
    };

    const deleteFlow = (flowId) => {
        setFlows(flows.filter(flow => flow.id !== flowId));
        if (editingFlow && editingFlow.id === flowId) {
            setEditingFlow(null);
        }
    };

    // Rest of the code remains the same...
    const startEditing = (flow) => {
        setEditingFlow({ ...flow });
        setNewStep('');
        setEditingStep({ index: -1, value: '' });
    };

    const addStep = () => {
        if (newStep.trim() && editingFlow) {
            setEditingFlow({
                ...editingFlow,
                steps: [...editingFlow.steps, newStep]
            });
            setNewStep('');
        }
    };

    const startEditingStep = (index, value) => {
        setEditingStep({ index, value });
    };

    const saveEditingStep = () => {
        if (editingStep.index !== -1 && editingStep.value.trim()) {
            const newSteps = [...editingFlow.steps];
            newSteps[editingStep.index] = editingStep.value;
            setEditingFlow({
                ...editingFlow,
                steps: newSteps
            });
            setEditingStep({ index: -1, value: '' });
        }
    };

    const removeStep = (stepIndex) => {
        setEditingFlow({
            ...editingFlow,
            steps: editingFlow.steps.filter((_, index) => index !== stepIndex)
        });
    };

    const handleDragStart = (index) => {
        setDraggedStep(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedStep === null || draggedStep === index) return;

        const newSteps = [...editingFlow.steps];
        const draggedItem = newSteps[draggedStep];
        newSteps.splice(draggedStep, 1);
        newSteps.splice(index, 0, draggedItem);

        setEditingFlow({
            ...editingFlow,
            steps: newSteps
        });
        setDraggedStep(index);
    };

    const handleDragEnd = () => {
        setDraggedStep(null);
    };

    const saveFlow = () => {
        setFlows(flows.map(flow =>
            flow.id === editingFlow.id ? editingFlow : flow
        ));
        setEditingFlow(null);
    };

    const exportFlows = () => {
        const dataStr = JSON.stringify(flows, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = 'flows.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    const importFlows = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedFlows = JSON.parse(e.target.result);
                    setFlows(importedFlows);
                } catch (error) {
                    alert('Error importing flows. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Flow Editor</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <Upload size={20} /> Import
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={importFlows}
                            className="hidden"
                        />
                        <button
                            onClick={exportFlows}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                        >
                            <Download size={20} /> Export
                        </button>
                    </div>
                </div>

                {/* Add new flow */}
                <div className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newFlowName}
                        onChange={(e) => setNewFlowName(e.target.value)}
                        placeholder="Enter new flow name"
                        className="flex-1 p-2 border rounded"
                    />
                    <button
                        onClick={addFlow}
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                    >
                        <Plus size={20} /> Add Flow
                    </button>
                </div>

                {/* Flow list */}
                <div className="space-y-4">
                    {flows.map(flow => (
                        <div key={flow.id} className="border rounded p-4">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-semibold">{flow.name}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditing(flow)}
                                        className="bg-green-500 text-white p-2 rounded"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => deleteFlow(flow.id)}
                                        className="bg-red-500 text-white p-2 rounded"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {flow.steps.map((step, index) => (
                                    <div key={index} className="bg-gray-50 p-2 rounded">
                                        {step}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit flow modal */}
            {editingFlow && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit Flow: {editingFlow.name}</h2>

                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newStep}
                                onChange={(e) => setNewStep(e.target.value)}
                                placeholder="Enter new step"
                                className="flex-1 p-2 border rounded"
                            />
                            <button
                                onClick={addStep}
                                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                <Plus size={20} /> Add Step
                            </button>
                        </div>

                        <div className="space-y-2 mb-4">
                            {editingFlow.steps.map((step, index) => (
                                <div
                                    key={index}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`flex items-center gap-2 bg-gray-50 p-2 rounded ${
                                        draggedStep === index ? 'opacity-50' : ''
                                    }`}
                                >
                                    <GripVertical className="cursor-move text-gray-400" size={20} />
                                    {editingStep.index === index ? (
                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={editingStep.value}
                                                onChange={(e) => setEditingStep({ index, value: e.target.value })}
                                                className="flex-1 p-1 border rounded"
                                                autoFocus
                                            />
                                            <button
                                                onClick={saveEditingStep}
                                                className="bg-green-500 text-white px-2 py-1 rounded"
                                            >
                                                <Save size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex justify-between items-center">
                                            <span>{step}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEditingStep(index, step)}
                                                    className="text-blue-500"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => removeStep(index)}
                                                    className="text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditingFlow(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveFlow}
                                className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                            >
                                <Save size={20} /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlowEditor;
