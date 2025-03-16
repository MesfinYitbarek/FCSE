import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, PlusCircle } from "lucide-react";
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
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold">Manage Weights</h2>
      <Card className="p-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Max Weight"
              type="number"
              value={form.maxWeight}
              onChange={(e) => setForm({ ...form, maxWeight: e.target.value })}
              required
            />
            <Input
              placeholder="Interval"
              type="number"
              value={form.interval}
              onChange={(e) => setForm({ ...form, interval: e.target.value })}
              required
            />
            <Select
              value={form.type}
              onValueChange={(value) => setForm({ ...form, type: value })}
            >
              <SelectTrigger>
                <SelectValue>{form.type === "preference" ? "Preference Weight" : "Course Experience Weight"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preference">Preference Weight</SelectItem>
                <SelectItem value="course">Course Experience Weight</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" className="col-span-3 mt-2 flex items-center gap-2">
              <PlusCircle className="h-5 w-5" /> {editingId ? "Update" : "Create"} Weight
            </Button>
          </form>
        </CardContent>
      </Card>

      <h3 className="text-2xl font-semibold">Preference Weights</h3>
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
                <Button variant="ghost" size="icon" onClick={() => handleEdit(weight, "preference")}> 
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h3 className="text-2xl font-semibold">Course Experience Weights</h3>
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
              <TableCell>{weight.interval}</T