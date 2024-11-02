import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Edit2, Download, Upload, GripVertical, Search, Undo2, Redo2, AlertCircle } from 'lucide-react';
import { validateStep } from './validation';

const useUndoRedo = (initialState) => {
    const [history, setHistory] = useState([initialState]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const canUndo = currentIndex > 0;
    const canRedo = currentIndex < history.length - 1;

    const pushState = (newState) => {
        const newHistory = history.slice(0, currentIndex + 1);
        setHistory([...newHistory, newState]);
        setCurrentIndex(currentIndex + 1);
    };

    const undo = () => {
        if (canUndo) {
            setCurrentIndex(currentIndex - 1);
            return history[currentIndex - 1];
        }
        return history[currentIndex];
    };

    const redo = () => {
        if (canRedo) {
            setCurrentIndex(currentIndex + 1);
            return history[currentIndex + 1];
        }
        return history[currentIndex];
    };

    return {
        state: history[currentIndex],
        pushState,
        undo,
        redo,
        canUndo,
        canRedo
    };
};

const FlowEditor = () => {
    const { state: flows, pushState, undo, redo, canUndo, canRedo } = useUndoRedo([]);
    const [editingFlow, setEditingFlow] = useState(null);
    const [newFlowName, setNewFlowName] = useState('');
    const [newStep, setNewStep] = useState('');
    const [editingStep, setEditingStep] = useState({ index: -1, value: '' });
    const [draggedStep, setDraggedStep] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [stepError, setStepError] = useState(null);
    const fileInputRef = useRef();

    const filteredFlows = flows.filter(flow =>
        flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        flow.steps.some(step => step.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const validateAndAddStep = () => {
        if (!newStep.trim()) return;

        const validation = validateStep(newStep);
        if (!validation.isValid) {
            setStepError(validation.error);
            return;
        }

        setStepError(null);
        const updatedFlow = {
            ...editingFlow,
            steps: [...editingFlow.steps, newStep]
        };
        setEditingFlow(updatedFlow);
        setNewStep('');
    };

    const handleStepEdit = (step) => {
        const validation = validateStep(step);
        if (!validation.isValid) {
            setStepError(validation.error);
            return false;
        }
        setStepError(null);
        return true;
    };


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
        if (editingFlow?.id === flowId) {
            setEditingFlow(null);
        }
    };

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
        const newFlows = flows.map(flow =>
            flow.id === editingFlow.id ? editingFlow : flow
        );
        pushState(newFlows);
        setEditingFlow(null);
    };

    const handleUndo = () => {
        const prevState = undo();
        setFlows(prevState);
    };

    const handleRedo = () => {
        const nextState = redo();
        setFlows(nextState);
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-8 bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Flow Editor</h1>
                    <div className="flex gap-2">
                        <button
                            onClick={handleUndo}
                            disabled={!canUndo}
                            className={`p-2 rounded ${canUndo ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                        >
                            <Undo2 size={20} />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={!canRedo}
                            className={`p-2 rounded ${canRedo ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                        >
                            <Redo2 size={20} />
                        </button>
                    </div>
                </div>

                {/* Search bar */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search flows and steps..."
                        className="w-full pl-10 p-2 border rounded"
                    />
                </div>

                {/* Rest of the component remains similar, with added validation feedback */}
                {stepError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 rounded flex items-center gap-2 text-red-700">
                        <AlertCircle size={20} />
                        {stepError}
                    </div>
                )}


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
