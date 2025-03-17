import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem } from "@mui/material";
import api from "../../utils/api";

const ManageWeights = () => {
  const [preferenceWeights, setPreferenceWeights] = useState([]);
  const [courseExperienceWeights, setCourseExperienceWeights] = useState([]);
  const [form, setForm] = useState({ maxWeight: "", interval: "", type: "preference" });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWeights();
  }, []);

  const fetchWeights = async () => {
    try {
      const prefRes = await api.get("/preference-weights");
      const expRes = await api.get("/course-experience-weights");
      setPreferenceWeights(prefRes.data);
      setCourseExperienceWeights(expRes.data);
    } catch (error) {
      console.error("Error fetching weights", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { maxWeight, interval, type } = form;
    const url = type === "preference" ? "/preference-weights" : "/course-experience-weights";
    const endpoint = editingId ? `${url}/${editingId}` : url;

    try {
      if (editingId) {
        await api.put(endpoint, { maxWeight, interval });
      } else {
        await api.post(endpoint, { maxWeight, interval });
      }
      fetchWeights();
      setForm({ maxWeight: "", interval: "", type: "preference" });
      setEditingId(null);
    } catch (error) {
      console.error("Error saving weight", error);
    }
  };

  const handleEdit = (weight, type) => {
    setForm({ maxWeight: weight.maxWeight, interval: weight.interval, type });
    setEditingId(weight._id);
  };

  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>Manage Weights</Typography>
      <Card className="mb-6 p-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TextField
              label="Max Weight"
              type="number"
              value={form.maxWeight}
              onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
              required
            />
            <TextField
              label="Interval"
              type="number"
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              required
            />
            <Select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              fullWidth
            >
              <MenuItem value="preference">Preference Weight</MenuItem>
              <MenuItem value="course">Course Experience Weight</MenuItem>
            </Select>
            <Button type="submit" variant="contained" color="primary" className="col-span-3 mt-2">
              {editingId ? "Update" : "Create"} Weight
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom>Preference Weights</Typography>
      <TableContainer component={Paper} className="mb-6">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Max Weight</TableCell>
              <TableCell>Interval</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {preferenceWeights.map((weight) => (
              <TableRow key={weight._id}>
                <TableCell>{weight.maxWeight}</TableCell>
                <TableCell>{weight.interval}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(weight, "preference")} size="small">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" gutterBottom>Course Experience Weights</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Max Weight</TableCell>
              <TableCell>Interval</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courseExperienceWeights.map((weight) => (
              <TableRow key={weight._id}>
                <TableCell>{weight.maxWeight}</TableCell>
                <TableCell>{weight.interval}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEdit(weight, "course")} size="small">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ManageWeights;
