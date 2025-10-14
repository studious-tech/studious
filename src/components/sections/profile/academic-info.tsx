'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export function AcademicInfo() {
  const [qualifications, setQualifications] = useState([
    { id: 1, degree: '', institution: '', year: '', grade: '' }
  ]);

  const addQualification = () => {
    setQualifications([
      ...qualifications,
      { id: qualifications.length + 1, degree: '', institution: '', year: '', grade: '' }
    ]);
  };

  const removeQualification = (id: number) => {
    if (qualifications.length > 1) {
      setQualifications(qualifications.filter(q => q.id !== id));
    }
  };

  const updateQualification = (id: number, field: string, value: string) => {
    setQualifications(
      qualifications.map(q => 
        q.id === id ? { ...q, [field]: value } : q
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {qualifications.map((qualification) => (
          <div key={qualification.id} className="grid grid-cols-1 gap-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label htmlFor={`degree-${qualification.id}`}>Degree</Label>
              <Input
                id={`degree-${qualification.id}`}
                placeholder="e.g., Bachelor of Science"
                value={qualification.degree}
                onChange={(e) => updateQualification(qualification.id, 'degree', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor={`institution-${qualification.id}`}>Institution</Label>
              <Input
                id={`institution-${qualification.id}`}
                placeholder="e.g., University of Oxford"
                value={qualification.institution}
                onChange={(e) => updateQualification(qualification.id, 'institution', e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`year-${qualification.id}`}>Year</Label>
                <Input
                  id={`year-${qualification.id}`}
                  placeholder="e.g., 2020"
                  value={qualification.year}
                  onChange={(e) => updateQualification(qualification.id, 'year', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor={`grade-${qualification.id}`}>Grade</Label>
                <Input
                  id={`grade-${qualification.id}`}
                  placeholder="e.g., 3.8 GPA"
                  value={qualification.grade}
                  onChange={(e) => updateQualification(qualification.id, 'grade', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeQualification(qualification.id)}
                disabled={qualifications.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Button type="button" variant="outline" onClick={addQualification} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Qualification
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ielts-score">IELTS Score</Label>
          <Input id="ielts-score" placeholder="e.g., 7.5" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="pte-score">PTE Score</Label>
          <Input id="pte-score" placeholder="e.g., 79" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="toefl-score">TOEFL Score</Label>
          <Input id="toefl-score" placeholder="e.g., 110" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="target-exam">Target Exam</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select target exam" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ielts">IELTS</SelectItem>
              <SelectItem value="pte">PTE Academic</SelectItem>
              <SelectItem value="toefl">TOEFL iBT</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="target-score">Target Score</Label>
        <Input id="target-score" placeholder="e.g., 8.0" />
      </div>
      
      <div className="flex justify-end">
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}