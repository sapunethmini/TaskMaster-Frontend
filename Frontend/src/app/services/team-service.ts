import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeamService {

private apiUrl = `${environment.TaskServiceUrl}/api/tasks`;


  constructor(private http: HttpClient) { }

  /**
   * Get all teams
   */
  getAllTeams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  /**
   * Get team by ID
   */
  getTeamById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }


  

  /**
   * Get team members by team ID
   */
  getTeamMembers(teamId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${teamId}/members`);
  }

  /**
   * Create a new team
   */
  createTeam(teamData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, teamData);
  }

  /**
   * Update a team
   */
  updateTeam(id: string, teamData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, teamData);
  }

  /**
   * Delete a team
   */
  deleteTeam(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }


  

}