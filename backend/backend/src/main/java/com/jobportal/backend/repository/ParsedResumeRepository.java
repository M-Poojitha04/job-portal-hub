package com.jobportal.backend.repository;

import com.jobportal.backend.model.ParsedResume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ParsedResumeRepository extends JpaRepository<ParsedResume, Long> {

    // Native query targeting ONLY the safe flat columns to guarantee serialization passes
    @Query(value = "SELECT id, candidate_name as candidateName, candidate_email as candidateEmail, highest_education as highestEducation, latest_experience as latestExperience FROM parsed_resumes", nativeQuery = true)
    List<ApplicantProjection> findAllFlatApplicants();

    // Fix the compiler error by explicitly defining the missing skill search query
    @Query(value = "SELECT pr.* FROM parsed_resumes pr JOIN resume_skills rs ON pr.id = rs.resume_id WHERE LOWER(rs.skill) LIKE LOWER(CONCAT('%', :skill, '%'))", nativeQuery = true)
    List<ParsedResume> findBySkillKeyword(@Param("skill") String skill);
}