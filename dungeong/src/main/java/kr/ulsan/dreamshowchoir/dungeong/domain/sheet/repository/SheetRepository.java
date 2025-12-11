package kr.ulsan.dreamshowchoir.dungeong.domain.sheet.repository;

import kr.ulsan.dreamshowchoir.dungeong.domain.sheet.Sheet;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SheetRepository extends JpaRepository<Sheet, Long> {
}
